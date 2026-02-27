import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalMappingRule } from '../../../database/entities/journal-mapping-rule.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';
import { CreateMappingRuleDto, UpdateMappingRuleDto } from './dto';

@Injectable()
export class JournalMappingService {
  constructor(
    @InjectRepository(JournalMappingRule)
    private mappingRuleRepository: Repository<JournalMappingRule>,
    @InjectRepository(ChartOfAccount)
    private coaRepository: Repository<ChartOfAccount>,
  ) {}

  /**
   * Create a new mapping rule
   */
  async create(createDto: CreateMappingRuleDto): Promise<JournalMappingRule> {
    // Check if sourceType already exists
    const existing = await this.mappingRuleRepository.findOne({
      where: { sourceType: createDto.sourceType },
    });

    if (existing) {
      throw new ConflictException(
        `Mapping rule for sourceType '${createDto.sourceType}' already exists`,
      );
    }

    // Validate all CoA codes exist
    await this.validateCoaCodes(createDto.debitRules, createDto.creditRules);

    // Validate percentage totals
    this.validatePercentages(createDto.debitRules, 'debit');
    this.validatePercentages(createDto.creditRules, 'credit');

    const mappingRule = this.mappingRuleRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
      priority: createDto.priority ?? 0,
      createdBy: createDto.createdBy || 'system',
    });

    return this.mappingRuleRepository.save(mappingRule);
  }

  /**
   * Find all mapping rules
   */
  async findAll(isActive?: boolean): Promise<JournalMappingRule[]> {
    const where = isActive !== undefined ? { isActive } : {};
    return this.mappingRuleRepository.find({
      where,
      order: { priority: 'ASC', sourceType: 'ASC' },
    });
  }

  /**
   * Find one mapping rule by ID
   */
  async findOne(id: string): Promise<JournalMappingRule> {
    const rule = await this.mappingRuleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Mapping rule with ID ${id} not found`);
    }
    return rule;
  }

  /**
   * Find mapping rule by sourceType
   */
  async findBySourceType(sourceType: string): Promise<JournalMappingRule | null> {
    return this.mappingRuleRepository.findOne({
      where: { sourceType, isActive: true },
    });
  }

  /**
   * Update mapping rule
   */
  async update(id: string, updateDto: UpdateMappingRuleDto): Promise<JournalMappingRule> {
    const rule = await this.findOne(id);

    // If sourceType is being changed, check for conflicts
    if (updateDto.sourceType && updateDto.sourceType !== rule.sourceType) {
      const existing = await this.mappingRuleRepository.findOne({
        where: { sourceType: updateDto.sourceType },
      });
      if (existing) {
        throw new ConflictException(
          `Mapping rule for sourceType '${updateDto.sourceType}' already exists`,
        );
      }
    }

    // Validate CoA codes if rules are being updated
    if (updateDto.debitRules || updateDto.creditRules) {
      await this.validateCoaCodes(
        updateDto.debitRules || rule.debitRules,
        updateDto.creditRules || rule.creditRules,
      );

      if (updateDto.debitRules) {
        this.validatePercentages(updateDto.debitRules, 'debit');
      }
      if (updateDto.creditRules) {
        this.validatePercentages(updateDto.creditRules, 'credit');
      }
    }

    Object.assign(rule, updateDto);
    return this.mappingRuleRepository.save(rule);
  }

  /**
   * Delete mapping rule
   */
  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);
    await this.mappingRuleRepository.remove(rule);
  }

  /**
   * Activate mapping rule
   */
  async activate(id: string): Promise<JournalMappingRule> {
    const rule = await this.findOne(id);
    rule.isActive = true;
    return this.mappingRuleRepository.save(rule);
  }

  /**
   * Deactivate mapping rule
   */
  async deactivate(id: string): Promise<JournalMappingRule> {
    const rule = await this.findOne(id);
    rule.isActive = false;
    return this.mappingRuleRepository.save(rule);
  }

  /**
   * Test mapping rule with sample amount
   * Returns preview of journal entries that would be created
   */
  async testRule(
    id: string,
    testAmount: number,
  ): Promise<{
    debitEntries: Array<{ coaCode: string; description: string; amount: number }>;
    creditEntries: Array<{ coaCode: string; description: string; amount: number }>;
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  }> {
    const rule = await this.findOne(id);

    const debitEntries = this.calculateAmounts(rule.debitRules, testAmount);
    const creditEntries = this.calculateAmounts(rule.creditRules, testAmount);

    const totalDebit = debitEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredit = creditEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return {
      debitEntries,
      creditEntries,
      totalDebit,
      totalCredit,
      isBalanced,
    };
  }

  /**
   * Validate that all CoA codes exist and are active
   */
  private async validateCoaCodes(debitRules: any[], creditRules: any[]): Promise<void> {
    const allCodes = [
      ...debitRules.map((r) => r.coaCode),
      ...creditRules.map((r) => r.coaCode),
    ];

    const uniqueCodes = [...new Set(allCodes)];

    for (const code of uniqueCodes) {
      const coa = await this.coaRepository.findOne({
        where: { kodeRekening: code },
      });

      if (!coa) {
        throw new BadRequestException(`Chart of Account '${code}' not found`);
      }

      if (!coa.isActive) {
        throw new BadRequestException(`Chart of Account '${code}' is not active`);
      }
    }
  }

  /**
   * Validate that percentages add up to 100% (or close enough)
   */
  private validatePercentages(rules: any[], type: string): void {
    const hasPercentage = rules.some((r) => r.percentage !== undefined && !r.isFixed);

    if (hasPercentage) {
      const totalPercentage = rules
        .filter((r) => !r.isFixed)
        .reduce((sum, r) => sum + (r.percentage || 0), 0);

      // Allow some tolerance for rounding
      if (Math.abs(totalPercentage - 100) > 0.1) {
        throw new BadRequestException(
          `${type} rules percentages must add up to 100% (current: ${totalPercentage}%)`,
        );
      }
    }
  }

  /**
   * Calculate amounts based on rules
   */
  private calculateAmounts(
    rules: any[],
    totalAmount: number,
  ): Array<{ coaCode: string; description: string; amount: number }> {
    return rules.map((rule) => {
      let amount: number;

      if (rule.isFixed) {
        amount = rule.fixedAmount || 0;
      } else {
        const percentage = rule.percentage || 100;
        amount = (totalAmount * percentage) / 100;
      }

      return {
        coaCode: rule.coaCode,
        description: rule.description,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimals
      };
    });
  }
}
