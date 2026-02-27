import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  Modal,
  Button,
  Input,
  Label,
  Textarea,
  CurrencyInput,
  NumberInputWithControls,
} from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { programRBAApi } from './api';
import type { CreateProgramRBADto, ProgramRBA } from './types';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

const indikatorSchema = z.object({
  nama: z.string().trim().min(1, 'Nama indikator wajib diisi'),
  satuan: z.string().trim().min(1, 'Satuan wajib diisi'),
  target: z.number().min(0.01, 'Target harus lebih dari 0'),
});

const programSchema = z.object({
  kodeProgram: z
    .string()
    .trim()
    .min(1, 'Kode program wajib diisi')
    .regex(/^\d\.\d{2}\.\d{2}$/, 'Format kode program harus 1.XX.XX (contoh: 1.02.02)'),
  namaProgram: z.string().trim().min(1, 'Nama program wajib diisi'),
  deskripsi: z.string().trim().optional(),
  paguAnggaran: z.number().min(0, 'Pagu anggaran tidak boleh negatif').optional(),
  indikatorProgram: z.array(indikatorSchema).min(1, 'Minimal 1 indikator diperlukan'),
});

type ProgramFormData = z.infer<typeof programSchema>;

interface ProgramRBAFormProps {
  open: boolean;
  onClose: () => void;
  program?: ProgramRBA;
}

export default function ProgramRBAForm({ open, onClose, program }: ProgramRBAFormProps) {
  const queryClient = useQueryClient();
  const { activeFiscalYear } = useFiscalYear();
  const fiscalYear = activeFiscalYear?.tahun || new Date().getFullYear();

  // Check if program has kegiatan (should disable editing except pagu)
  const hasKegiatan = program?.kegiatan && program.kegiatan.length > 0;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      kodeProgram: '',
      namaProgram: '',
      deskripsi: '',
      paguAnggaran: 0,
      indikatorProgram: [{ nama: '', satuan: '', target: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'indikatorProgram',
  });

  // Update form values when program changes
  useEffect(() => {
    if (program) {
      reset({
        kodeProgram: program.kodeProgram,
        namaProgram: program.namaProgram,
        deskripsi: program.deskripsi || '',
        paguAnggaran: program.paguAnggaran || 0,
        indikatorProgram: program.indikatorProgram || [{ nama: '', satuan: '', target: 1 }],
      });
    } else {
      reset({
        kodeProgram: '',
        namaProgram: '',
        deskripsi: '',
        paguAnggaran: 0,
        indikatorProgram: [{ nama: '', satuan: '', target: 1 }],
      });
    }
  }, [program, reset]);

  const createMutation = useMutation({
    mutationFn: programRBAApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['program-rba'] });

      // Check if this was a restore operation (program was created with same ID as deleted one)
      const wasRestored = program?.id === data.id;
      const message = wasRestored
        ? '✅ Program RBA berhasil dipulihkan dari data yang dihapus sebelumnya!'
        : '✅ Program RBA berhasil ditambahkan!';

      alert(message);
      reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Gagal menambahkan program';
      alert('❌ Error: ' + errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateProgramRBADto }) =>
      programRBAApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-rba'] });
      alert('✅ Program RBA berhasil diupdate!');
      reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Gagal mengupdate program';
      alert('❌ Error: ' + errorMessage);
    },
  });

  const onSubmit = (data: ProgramFormData) => {
    // Add fiscal year from context
    const submitData = {
      ...data,
      tahun: fiscalYear,
    } as CreateProgramRBADto;

    if (program) {
      // Jika program sudah punya kegiatan, hanya update pagu anggaran
      if (hasKegiatan) {
        updateMutation.mutate({
          id: program.id,
          data: { paguAnggaran: data.paguAnggaran, tahun: fiscalYear } as CreateProgramRBADto
        });
      } else {
        // Jika belum ada kegiatan, bisa update semua field
        updateMutation.mutate({ id: program.id, data: submitData });
      }
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const formFooter = (
    <>
      <Button type="button" variant="outline" onClick={handleClose}>
        Batal
      </Button>
      <Button
        type="submit"
        form="program-form"
        disabled={createMutation.isPending || updateMutation.isPending}
      >
        {createMutation.isPending || updateMutation.isPending
          ? 'Menyimpan...'
          : program
            ? 'Update Program'
            : 'Tambah Program'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={program ? 'Edit Program RBA' : 'Tambah Program RBA'}
      size="xl"
      footer={formFooter}
    >
      <form id="program-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {hasKegiatan && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ <strong>Program ini sudah memiliki kegiatan.</strong> Hanya Pagu Anggaran yang dapat diedit.
                Field lainnya tidak dapat diubah untuk menjaga konsistensi data.
              </p>
            </div>
          )}

          {/* Kode Program */}
          <div className="space-y-2">
            <Label htmlFor="kodeProgram">
              Kode Program <span className="text-red-500">*</span>
            </Label>
            <Input
              id="kodeProgram"
              {...register('kodeProgram')}
              placeholder="Contoh: 1.02.02"
              className={errors.kodeProgram ? 'border-red-500' : ''}
              disabled={hasKegiatan}
            />
            {errors.kodeProgram && (
              <p className="text-sm text-red-500">{errors.kodeProgram.message}</p>
            )}
          </div>

          {/* Nama Program */}
          <div className="space-y-2">
            <Label htmlFor="namaProgram">
              Nama Program <span className="text-red-500">*</span>
            </Label>
            <Input
              id="namaProgram"
              {...register('namaProgram')}
              placeholder="Contoh: PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN"
              className={errors.namaProgram ? 'border-red-500' : ''}
              disabled={hasKegiatan}
            />
            {errors.namaProgram && (
              <p className="text-sm text-red-500">{errors.namaProgram.message}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              {...register('deskripsi')}
              placeholder="Deskripsi singkat program..."
              rows={3}
              disabled={hasKegiatan}
            />
          </div>

          {/* Tahun - Display only, not editable */}
          <div className="space-y-2">
            <Label htmlFor="tahun">Tahun Anggaran</Label>
            <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
              {fiscalYear}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tahun anggaran diambil dari pengaturan tahun fiskal aktif
            </p>
          </div>

          {/* Pagu Anggaran */}
          <div className="space-y-2">
            <Label htmlFor="paguAnggaran">
              Pagu Anggaran
            </Label>
            <Controller
              name="paguAnggaran"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="paguAnggaran"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Contoh: 10.000.000.000"
                  disabled={hasKegiatan ? false : undefined}
                  error={errors.paguAnggaran?.message}
                  helperText="Format: 100.245.969.427 atau 100.245.969.427,00"
                />
              )}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total pagu anggaran program (akan membatasi total pagu kegiatan)
            </p>
          </div>

          {/* Indikator Program */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>
                Indikator Program <span className="text-red-500">*</span>
              </Label>
              {!hasKegiatan && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => append({ nama: '', satuan: '', target: 1 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Indikator
                </Button>
              )}
            </div>

            {errors.indikatorProgram && (
              <p className="text-sm text-red-500">{errors.indikatorProgram.message}</p>
            )}

            <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Indikator {index + 1}</h4>
                    {fields.length > 1 && !hasKegiatan && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 md:col-span-2">
                      <Label htmlFor={`indikatorProgram.${index}.nama`}>
                        Nama Indikator <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`indikatorProgram.${index}.nama`}
                        {...register(`indikatorProgram.${index}.nama`)}
                        placeholder="Contoh: Persentase pelayanan administrasi tepat waktu"
                        className={
                          errors.indikatorProgram?.[index]?.nama ? 'border-red-500' : ''
                        }
                        disabled={hasKegiatan}
                      />
                      {errors.indikatorProgram?.[index]?.nama && (
                        <p className="text-sm text-red-500">
                          {errors.indikatorProgram[index]?.nama?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`indikatorProgram.${index}.satuan`}>
                        Satuan <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`indikatorProgram.${index}.satuan`}
                        {...register(`indikatorProgram.${index}.satuan`)}
                        placeholder="Contoh: %"
                        className={
                          errors.indikatorProgram?.[index]?.satuan ? 'border-red-500' : ''
                        }
                        disabled={hasKegiatan}
                      />
                      {errors.indikatorProgram?.[index]?.satuan && (
                        <p className="text-sm text-red-500">
                          {errors.indikatorProgram[index]?.satuan?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-3 md:col-span-1">
                      <Label htmlFor={`indikatorProgram.${index}.target`}>
                        Target <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name={`indikatorProgram.${index}.target`}
                        control={control}
                        render={({ field }) => (
                          <NumberInputWithControls
                            id={`indikatorProgram.${index}.target`}
                            value={field.value}
                            onChange={field.onChange}
                            min={0.01}
                            step={0.01}
                            error={!!errors.indikatorProgram?.[index]?.target}
                            disabled={hasKegiatan}
                            placeholder="0"
                          />
                        )}
                      />
                      {errors.indikatorProgram?.[index]?.target && (
                        <p className="text-sm text-red-500">
                          {errors.indikatorProgram[index]?.target?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
  );
}