import { Test, TestingModule } from '@nestjs/testing';
import { UnitKerjaService } from './unit-kerja.service';

describe('UnitKerjaService', () => {
  let service: UnitKerjaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitKerjaService],
    }).compile();

    service = module.get<UnitKerjaService>(UnitKerjaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
