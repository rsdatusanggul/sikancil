import { Test, TestingModule } from '@nestjs/testing';
import { UnitKerjaController } from './unit-kerja.controller';

describe('UnitKerjaController', () => {
  let controller: UnitKerjaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitKerjaController],
    }).compile();

    controller = module.get<UnitKerjaController>(UnitKerjaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
