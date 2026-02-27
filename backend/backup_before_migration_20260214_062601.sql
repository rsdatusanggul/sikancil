--
-- PostgreSQL database dump
--

\restrict kUtlCLWSQqj31xX6Bv5KZ7GUPLmXP4qAFKcmxAfDpFWfsiH4rWfHYb6OZbNOT6v

-- Dumped from database version 17.8 (Debian 17.8-1.pgdg13+1)
-- Dumped by pg_dump version 17.8 (Debian 17.8-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: accounts_payable_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.accounts_payable_status_enum AS ENUM (
    'UNPAID',
    'PARTIAL',
    'PAID',
    'OVERDUE'
);


ALTER TYPE public.accounts_payable_status_enum OWNER TO sikancil_user;

--
-- Name: accounts_receivable_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.accounts_receivable_status_enum AS ENUM (
    'UNPAID',
    'PARTIAL',
    'PAID',
    'OVERDUE'
);


ALTER TYPE public.accounts_receivable_status_enum OWNER TO sikancil_user;

--
-- Name: bank_transactions_jenis_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.bank_transactions_jenis_enum AS ENUM (
    'DEBIT',
    'CREDIT',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'ADJUSTMENT'
);


ALTER TYPE public.bank_transactions_jenis_enum OWNER TO sikancil_user;

--
-- Name: bank_transactions_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.bank_transactions_status_enum AS ENUM (
    'DRAFT',
    'POSTED',
    'CANCELLED',
    'VOID'
);


ALTER TYPE public.bank_transactions_status_enum OWNER TO sikancil_user;

--
-- Name: budgets_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.budgets_status_enum AS ENUM (
    'DRAFT',
    'ACTIVE',
    'REVISED',
    'CLOSED'
);


ALTER TYPE public.budgets_status_enum OWNER TO sikancil_user;

--
-- Name: cash_transactions_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.cash_transactions_status_enum AS ENUM (
    'DRAFT',
    'POSTED',
    'CANCELLED',
    'VOID'
);


ALTER TYPE public.cash_transactions_status_enum OWNER TO sikancil_user;

--
-- Name: chart_of_accounts_jenisakun_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.chart_of_accounts_jenisakun_enum AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE'
);


ALTER TYPE public.chart_of_accounts_jenisakun_enum OWNER TO sikancil_user;

--
-- Name: fixed_assets_metodedepresiasi_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.fixed_assets_metodedepresiasi_enum AS ENUM (
    'STRAIGHT_LINE',
    'DECLINING_BALANCE',
    'DOUBLE_DECLINING',
    'UNITS_OF_PRODUCTION'
);


ALTER TYPE public.fixed_assets_metodedepresiasi_enum OWNER TO sikancil_user;

--
-- Name: fixed_assets_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.fixed_assets_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE',
    'DISPOSED',
    'LOST'
);


ALTER TYPE public.fixed_assets_status_enum OWNER TO sikancil_user;

--
-- Name: journal_entries_jenisjurnal_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.journal_entries_jenisjurnal_enum AS ENUM (
    'GENERAL',
    'ADJUSTMENT',
    'CLOSING',
    'REVERSAL',
    'AUTO'
);


ALTER TYPE public.journal_entries_jenisjurnal_enum OWNER TO sikancil_user;

--
-- Name: journal_entries_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.journal_entries_status_enum AS ENUM (
    'DRAFT',
    'POSTED',
    'CANCELLED',
    'VOID'
);


ALTER TYPE public.journal_entries_status_enum OWNER TO sikancil_user;

--
-- Name: kontrak_pengadaan_jenispengadaan_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.kontrak_pengadaan_jenispengadaan_enum AS ENUM (
    'BARANG',
    'JASA_KONSULTANSI',
    'JASA_LAINNYA',
    'PEKERJAAN_KONSTRUKSI'
);


ALTER TYPE public.kontrak_pengadaan_jenispengadaan_enum OWNER TO sikancil_user;

--
-- Name: kontrak_pengadaan_metodepengadaan_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.kontrak_pengadaan_metodepengadaan_enum AS ENUM (
    'TENDER_TERBUKA',
    'TENDER_TERBATAS',
    'SELEKSI',
    'PENUNJUKAN_LANGSUNG',
    'E_PURCHASING',
    'PENGADAAN_LANGSUNG'
);


ALTER TYPE public.kontrak_pengadaan_metodepengadaan_enum OWNER TO sikancil_user;

--
-- Name: kontrak_pengadaan_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.kontrak_pengadaan_status_enum AS ENUM (
    'AKTIF',
    'SELESAI',
    'TERMINATE'
);


ALTER TYPE public.kontrak_pengadaan_status_enum OWNER TO sikancil_user;

--
-- Name: payroll_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.payroll_status_enum AS ENUM (
    'DRAFT',
    'POSTED',
    'CANCELLED',
    'VOID'
);


ALTER TYPE public.payroll_status_enum OWNER TO sikancil_user;

--
-- Name: pendapatan_blud_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.pendapatan_blud_status_enum AS ENUM (
    'DRAFT',
    'POSTED',
    'CANCELLED',
    'VOID'
);


ALTER TYPE public.pendapatan_blud_status_enum OWNER TO sikancil_user;

--
-- Name: pendapatan_blud_sumberdana_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.pendapatan_blud_sumberdana_enum AS ENUM (
    'APBD',
    'PNBP_FUNGSIONAL',
    'HIBAH',
    'PINJAMAN',
    'LAIN_LAIN'
);


ALTER TYPE public.pendapatan_blud_sumberdana_enum OWNER TO sikancil_user;

--
-- Name: rba_belanja_jenisbelanja_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.rba_belanja_jenisbelanja_enum AS ENUM (
    'PEGAWAI',
    'BARANG_JASA',
    'MODAL',
    'BUNGA',
    'TAK_TERDUGA'
);


ALTER TYPE public.rba_belanja_jenisbelanja_enum OWNER TO sikancil_user;

--
-- Name: rba_pendapatan_sumberdana_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.rba_pendapatan_sumberdana_enum AS ENUM (
    'APBD',
    'PNBP_FUNGSIONAL',
    'HIBAH',
    'PINJAMAN',
    'LAIN_LAIN'
);


ALTER TYPE public.rba_pendapatan_sumberdana_enum OWNER TO sikancil_user;

--
-- Name: spp_jenisspp_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.spp_jenisspp_enum AS ENUM (
    'SPP_UP',
    'SPP_GU',
    'SPP_TU',
    'SPP_LS_GAJI',
    'SPP_LS_BARANG_JASA',
    'SPP_LS_MODAL'
);


ALTER TYPE public.spp_jenisspp_enum OWNER TO sikancil_user;

--
-- Name: spp_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.spp_status_enum AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'VERIFIED',
    'APPROVED',
    'REJECTED',
    'DIBAYAR'
);


ALTER TYPE public.spp_status_enum OWNER TO sikancil_user;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.users_role_enum AS ENUM (
    'super_admin',
    'admin',
    'kepala_blud',
    'bendahara',
    'staff_keuangan',
    'user'
);


ALTER TYPE public.users_role_enum OWNER TO sikancil_user;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: sikancil_user
--

CREATE TYPE public.users_status_enum AS ENUM (
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE public.users_status_enum OWNER TO sikancil_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts_payable; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.accounts_payable (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorAP" character varying(100) NOT NULL,
    tanggal timestamp without time zone NOT NULL,
    "tanggalJatuhTempo" date NOT NULL,
    "supplierId" uuid NOT NULL,
    "nomorInvoice" character varying(100),
    uraian text NOT NULL,
    "nilaiHutang" numeric(15,2) NOT NULL,
    "nilaiDibayar" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "sisaHutang" numeric(15,2) NOT NULL,
    status public.accounts_payable_status_enum DEFAULT 'UNPAID'::public.accounts_payable_status_enum NOT NULL,
    "sppId" uuid,
    "journalId" uuid,
    "isPosted" boolean DEFAULT false NOT NULL,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accounts_payable OWNER TO sikancil_user;

--
-- Name: accounts_receivable; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.accounts_receivable (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorAR" character varying(100) NOT NULL,
    tanggal timestamp without time zone NOT NULL,
    "tanggalJatuhTempo" date NOT NULL,
    "namaDebitur" character varying(255) NOT NULL,
    "nomorInvoice" character varying(100),
    uraian text NOT NULL,
    "nilaiPiutang" numeric(15,2) NOT NULL,
    "nilaiDiterima" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "sisaPiutang" numeric(15,2) NOT NULL,
    status public.accounts_receivable_status_enum DEFAULT 'UNPAID'::public.accounts_receivable_status_enum NOT NULL,
    "journalId" uuid,
    "isPosted" boolean DEFAULT false NOT NULL,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accounts_receivable OWNER TO sikancil_user;

--
-- Name: addendum; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.addendum (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "kontrakId" uuid NOT NULL,
    "nomorAddendum" character varying(100) NOT NULL,
    "tanggalAddendum" timestamp without time zone NOT NULL,
    "jenisPerubahan" character varying(100) NOT NULL,
    "nilaiSebelum" numeric(15,2),
    "nilaiSesudah" numeric(15,2),
    "waktuSebelum" timestamp without time zone,
    "waktuSesudah" timestamp without time zone,
    "alasanPerubahan" text NOT NULL,
    "filePath" character varying(500),
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.addendum OWNER TO sikancil_user;

--
-- Name: anggaran_kas; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.anggaran_kas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "rbaId" uuid NOT NULL,
    bulan integer NOT NULL,
    tahun integer NOT NULL,
    "saldoAwal" numeric(15,2) NOT NULL,
    "penerimaanAPBD" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "penerimaanFungsional" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "penerimaanHibah" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "penerimaanLain" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalPenerimaan" numeric(15,2) NOT NULL,
    "belanjaPegawai" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "belanjaBarangJasa" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "belanjaModal" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "belanjaLain" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalPengeluaran" numeric(15,2) NOT NULL,
    "saldoAkhir" numeric(15,2) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.anggaran_kas OWNER TO sikancil_user;

--
-- Name: approval_logs; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.approval_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "documentType" character varying(100) NOT NULL,
    "documentId" uuid NOT NULL,
    "documentNo" character varying(100),
    action character varying(50) NOT NULL,
    "previousStatus" character varying(50),
    "newStatus" character varying(50) NOT NULL,
    comments text,
    "performedBy" character varying NOT NULL,
    "ipAddress" character varying(100),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.approval_logs OWNER TO sikancil_user;

--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.bank_accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "kodeBank" character varying(50) NOT NULL,
    "namaBank" character varying(255) NOT NULL,
    "nomorRekening" character varying(100) NOT NULL,
    "namaPemilik" character varying(255) NOT NULL,
    cabang character varying(255),
    swift character varying(100),
    "saldoAwal" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "saldoBerjalan" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying(50) DEFAULT 'IDR'::character varying NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    keterangan text,
    "createdBy" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bank_accounts OWNER TO sikancil_user;

--
-- Name: bank_transactions; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.bank_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorTransaksi" character varying(100) NOT NULL,
    tanggal timestamp without time zone NOT NULL,
    "bankAccountId" uuid NOT NULL,
    jenis public.bank_transactions_jenis_enum NOT NULL,
    uraian text NOT NULL,
    debit numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    credit numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    saldo numeric(15,2) NOT NULL,
    "referenceNo" character varying(100),
    "referenceType" character varying(50),
    "referenceId" uuid,
    "isReconciled" boolean DEFAULT false NOT NULL,
    "reconciledAt" timestamp without time zone,
    status public.bank_transactions_status_enum DEFAULT 'DRAFT'::public.bank_transactions_status_enum NOT NULL,
    "journalId" uuid,
    "isPosted" boolean DEFAULT false NOT NULL,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bank_transactions OWNER TO sikancil_user;

--
-- Name: budgets; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.budgets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "fiscalYearId" uuid NOT NULL,
    "kodeRekening" character varying(20) NOT NULL,
    "unitKerjaId" uuid,
    "anggaranAwal" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    revisi numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "anggaranAkhir" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    realisasi numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    sisa numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    status public.budgets_status_enum DEFAULT 'DRAFT'::public.budgets_status_enum NOT NULL,
    keterangan text,
    "createdBy" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.budgets OWNER TO sikancil_user;

--
-- Name: buku_kas_umum; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.buku_kas_umum (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorUrut" integer NOT NULL,
    tanggal timestamp without time zone NOT NULL,
    jenis character varying(50) NOT NULL,
    uraian text NOT NULL,
    "kodeRekening" character varying(20) NOT NULL,
    penerimaan numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    pengeluaran numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    saldo numeric(15,2) NOT NULL,
    "referenceType" character varying(50),
    "referenceId" uuid,
    "referenceNo" character varying(100),
    "journalId" uuid,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.buku_kas_umum OWNER TO sikancil_user;

--
-- Name: cash_transactions; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.cash_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorTransaksi" character varying(100) NOT NULL,
    tanggal timestamp without time zone NOT NULL,
    jenis character varying(50) NOT NULL,
    uraian text NOT NULL,
    jumlah numeric(15,2) NOT NULL,
    diterima_dari character varying(255),
    dibayar_kepada character varying(255),
    "unitKerjaId" uuid,
    status public.cash_transactions_status_enum DEFAULT 'DRAFT'::public.cash_transactions_status_enum NOT NULL,
    "journalId" uuid,
    "isPosted" boolean DEFAULT false NOT NULL,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cash_transactions OWNER TO sikancil_user;

--
-- Name: chart_of_accounts; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.chart_of_accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "kodeRekening" character varying(20) NOT NULL,
    "namaRekening" character varying(255) NOT NULL,
    "jenisAkun" public.chart_of_accounts_jenisakun_enum NOT NULL,
    level integer NOT NULL,
    "parentKode" character varying(20),
    "isActive" boolean DEFAULT true NOT NULL,
    "isHeader" boolean DEFAULT false NOT NULL,
    deskripsi text,
    "normalBalance" character varying(10) NOT NULL,
    "isBudgetControl" boolean DEFAULT false NOT NULL,
    "createdBy" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chart_of_accounts OWNER TO sikancil_user;

--
-- Name: depreciation_schedules; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.depreciation_schedules (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "assetId" uuid NOT NULL,
    tahun integer NOT NULL,
    bulan integer NOT NULL,
    "nilaiAwal" numeric(15,2) NOT NULL,
    "bebanDepresiasi" numeric(15,2) NOT NULL,
    "akumulasiDepresiasi" numeric(15,2) NOT NULL,
    "nilaiBuku" numeric(15,2) NOT NULL,
    "isPosted" boolean DEFAULT false NOT NULL,
    "journalId" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.depreciation_schedules OWNER TO sikancil_user;

--
-- Name: dokumen_spp; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.dokumen_spp (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "sppId" uuid NOT NULL,
    "namaDokumen" character varying(255) NOT NULL,
    "jenisDokumen" character varying(100) NOT NULL,
    "filePath" character varying(500) NOT NULL,
    "fileSize" integer NOT NULL,
    "uploadedBy" character varying NOT NULL,
    "uploadedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dokumen_spp OWNER TO sikancil_user;

--
-- Name: fiscal_years; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.fiscal_years (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tahun integer NOT NULL,
    "tanggalMulai" date NOT NULL,
    "tanggalSelesai" date NOT NULL,
    status character varying(50) NOT NULL,
    "isCurrent" boolean DEFAULT false NOT NULL,
    keterangan text,
    "createdBy" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.fiscal_years OWNER TO sikancil_user;

--
-- Name: fixed_assets; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.fixed_assets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "kodeAset" character varying(100) NOT NULL,
    "namaAset" character varying(255) NOT NULL,
    kategori character varying(100) NOT NULL,
    deskripsi text,
    "unitKerjaId" uuid,
    lokasi character varying(255),
    "tanggalPerolehan" date NOT NULL,
    "nilaiPerolehan" numeric(15,2) NOT NULL,
    supplier character varying(255),
    "metodeDepresiasi" public.fixed_assets_metodedepresiasi_enum NOT NULL,
    "umurEkonomis" integer NOT NULL,
    "nilaiResidu" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "akumulasiDepresiasi" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "nilaiBuku" numeric(15,2) NOT NULL,
    status public.fixed_assets_status_enum DEFAULT 'ACTIVE'::public.fixed_assets_status_enum NOT NULL,
    "tanggalDisposal" date,
    "nilaiDisposal" numeric(15,2),
    "createdBy" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.fixed_assets OWNER TO sikancil_user;

--
-- Name: journal_details; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.journal_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "journalId" uuid NOT NULL,
    "lineNumber" integer NOT NULL,
    "kodeRekening" character varying(20) NOT NULL,
    deskripsi character varying(255),
    "unitKerjaId" uuid,
    debit numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    credit numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.journal_details OWNER TO sikancil_user;

--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorJurnal" character varying(100) NOT NULL,
    "tanggalJurnal" timestamp without time zone NOT NULL,
    "jenisJurnal" public.journal_entries_jenisjurnal_enum DEFAULT 'GENERAL'::public.journal_entries_jenisjurnal_enum NOT NULL,
    "referenceType" character varying(100),
    "referenceId" uuid,
    "referenceNo" character varying(100),
    deskripsi text NOT NULL,
    "totalDebit" numeric(15,2) NOT NULL,
    "totalCredit" numeric(15,2) NOT NULL,
    status public.journal_entries_status_enum DEFAULT 'DRAFT'::public.journal_entries_status_enum NOT NULL,
    "postedBy" character varying,
    "postedAt" timestamp without time zone,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.journal_entries OWNER TO sikancil_user;

--
-- Name: kontrak_pengadaan; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.kontrak_pengadaan (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorKontrak" character varying(100) NOT NULL,
    "tanggalKontrak" timestamp without time zone NOT NULL,
    "vendorId" uuid,
    "namaVendor" character varying(255) NOT NULL,
    "npwpVendor" character varying(100),
    "jenisPengadaan" public.kontrak_pengadaan_jenispengadaan_enum NOT NULL,
    "metodePengadaan" public.kontrak_pengadaan_metodepengadaan_enum NOT NULL,
    "nilaiKontrak" numeric(15,2) NOT NULL,
    "tahunAnggaran" integer NOT NULL,
    "kodeRekening" character varying(20) NOT NULL,
    "tanggalMulai" date NOT NULL,
    "tanggalSelesai" date NOT NULL,
    "progresRealisasi" numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    "totalDibayar" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "sisaKontrak" numeric(15,2) NOT NULL,
    status public.kontrak_pengadaan_status_enum NOT NULL,
    "filePath" character varying(500),
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.kontrak_pengadaan OWNER TO sikancil_user;

--
-- Name: payroll; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.payroll (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorPayroll" character varying(100) NOT NULL,
    bulan integer NOT NULL,
    tahun integer NOT NULL,
    "pegawaiId" uuid NOT NULL,
    "gajiPokok" numeric(15,2) NOT NULL,
    "tunjanganJabatan" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "tunjanganKinerja" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "tunjanganLain" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalPenghasilan" numeric(15,2) NOT NULL,
    pph21 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "iuranPensiun" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    bpjs numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "potonganLain" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalPotongan" numeric(15,2) NOT NULL,
    "gajiNetto" numeric(15,2) NOT NULL,
    status public.payroll_status_enum DEFAULT 'DRAFT'::public.payroll_status_enum NOT NULL,
    "sppId" uuid,
    "journalId" uuid,
    "isPosted" boolean DEFAULT false NOT NULL,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payroll OWNER TO sikancil_user;

--
-- Name: pegawai; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.pegawai (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nip character varying(50) NOT NULL,
    "namaLengkap" character varying(255) NOT NULL,
    "unitKerjaId" uuid NOT NULL,
    jabatan character varying(255),
    golongan character varying(100) NOT NULL,
    email character varying(100),
    telepon character varying(50),
    npwp character varying(100),
    "bankName" character varying(255),
    "nomorRekening" character varying(100),
    "namaRekening" character varying(255),
    "tanggalMasuk" date,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "createdBy" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pegawai OWNER TO sikancil_user;

--
-- Name: pendapatan_blud; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.pendapatan_blud (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorBukti" character varying(100) NOT NULL,
    tanggal timestamp without time zone NOT NULL,
    "sumberDana" public.pendapatan_blud_sumberdana_enum NOT NULL,
    "kategoriPendapatan" character varying(100) NOT NULL,
    uraian text NOT NULL,
    jumlah numeric(15,2) NOT NULL,
    "simrsReferenceId" character varying(100),
    "simrsData" jsonb,
    "nomorSP2D" character varying(100),
    "tanggalSP2D" timestamp without time zone,
    "pemberiHibah" character varying(255),
    "nomorSKHibah" character varying(100),
    "tanggalSKHibah" timestamp without time zone,
    disetor boolean DEFAULT false NOT NULL,
    "tanggalSetor" timestamp without time zone,
    "nomorSTS" character varying(100),
    "nomorBKU" character varying(100),
    "journalId" uuid,
    "isPosted" boolean DEFAULT false NOT NULL,
    "unitKerjaId" uuid,
    status public.pendapatan_blud_status_enum DEFAULT 'DRAFT'::public.pendapatan_blud_status_enum NOT NULL,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pendapatan_blud OWNER TO sikancil_user;

--
-- Name: rba; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.rba (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    kode character varying(50) NOT NULL,
    "tahunAnggaran" integer NOT NULL,
    status character varying(50) NOT NULL,
    "revisiKe" integer DEFAULT 0 NOT NULL,
    visi text,
    misi text,
    tujuan text,
    "targetOutput" jsonb,
    iku jsonb,
    "proyeksiPendapatan" numeric(15,2) NOT NULL,
    "proyeksiBelanja" numeric(15,2) NOT NULL,
    "proyeksiPembiayaan" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "tanggalPenyusunan" timestamp without time zone NOT NULL,
    "tanggalApproval" timestamp without time zone,
    "approvedBy" character varying,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rba OWNER TO sikancil_user;

--
-- Name: rba_belanja; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.rba_belanja (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "rbaId" uuid NOT NULL,
    "kodeRekening" character varying(20) NOT NULL,
    uraian character varying(255) NOT NULL,
    "jenisBelanja" public.rba_belanja_jenisbelanja_enum NOT NULL,
    tw1 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tw2 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tw3 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tw4 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalProyeksi" numeric(15,2) NOT NULL,
    keterangan text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rba_belanja OWNER TO sikancil_user;

--
-- Name: rba_pembiayaan; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.rba_pembiayaan (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "rbaId" uuid NOT NULL,
    jenis character varying(50) NOT NULL,
    "kodeRekening" character varying(20) NOT NULL,
    uraian character varying(255) NOT NULL,
    nilai numeric(15,2) NOT NULL,
    keterangan text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rba_pembiayaan OWNER TO sikancil_user;

--
-- Name: rba_pendapatan; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.rba_pendapatan (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "rbaId" uuid NOT NULL,
    "kodeRekening" character varying(20) NOT NULL,
    uraian character varying(255) NOT NULL,
    "sumberDana" public.rba_pendapatan_sumberdana_enum NOT NULL,
    tw1 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tw2 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tw3 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tw4 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalProyeksi" numeric(15,2) NOT NULL,
    keterangan text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rba_pendapatan OWNER TO sikancil_user;

--
-- Name: revisi_rba; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.revisi_rba (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "rbaId" uuid NOT NULL,
    "revisiKe" integer NOT NULL,
    "tanggalRevisi" timestamp without time zone NOT NULL,
    "alasanRevisi" text NOT NULL,
    "perubahanData" jsonb NOT NULL,
    "approvedBy" character varying,
    "approvedAt" timestamp without time zone,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.revisi_rba OWNER TO sikancil_user;

--
-- Name: sp2d; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.sp2d (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorSP2D" character varying(100) NOT NULL,
    "tanggalSP2D" timestamp without time zone NOT NULL,
    "nilaiSP2D" numeric(15,2) NOT NULL,
    "tanggalCair" timestamp without time zone,
    "statusCair" character varying(50) NOT NULL,
    "bankPencairan" character varying(255) NOT NULL,
    "nomorReferensi" character varying(100),
    "approvedBy" character varying NOT NULL,
    "approvedAt" timestamp without time zone NOT NULL,
    "ttdDigital" character varying(500),
    "nomorBKU" character varying(100),
    "isPosted" boolean DEFAULT false NOT NULL,
    "journalId" uuid,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sp2d OWNER TO sikancil_user;

--
-- Name: spm; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.spm (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorSPM" character varying(100) NOT NULL,
    "tanggalSPM" timestamp without time zone NOT NULL,
    "nilaiSPM" numeric(15,2) NOT NULL,
    "namaPenerima" character varying(255) NOT NULL,
    "nomorRekening" character varying(100) NOT NULL,
    "namaBank" character varying(255) NOT NULL,
    status character varying(50) NOT NULL,
    "approvedBy" character varying,
    "approvedAt" timestamp without time zone,
    "ttdDigital" character varying(500),
    "sp2dId" uuid,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.spm OWNER TO sikancil_user;

--
-- Name: spp; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.spp (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorSPP" character varying(100) NOT NULL,
    "tanggalSPP" timestamp without time zone NOT NULL,
    "jenisSPP" public.spp_jenisspp_enum NOT NULL,
    "tahunAnggaran" integer NOT NULL,
    "unitKerjaId" uuid NOT NULL,
    "pengajuId" uuid NOT NULL,
    "nilaiSPP" numeric(15,2) NOT NULL,
    uraian text NOT NULL,
    pph21 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    pph22 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    pph23 numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    ppn numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalPajak" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "nilaiBersih" numeric(15,2) NOT NULL,
    "namaPenerima" character varying(255) NOT NULL,
    "npwpPenerima" character varying(100),
    "bankPenerima" character varying(255) NOT NULL,
    "rekeningPenerima" character varying(100) NOT NULL,
    "kontrakId" uuid,
    status public.spp_status_enum DEFAULT 'DRAFT'::public.spp_status_enum NOT NULL,
    "submittedBy" character varying,
    "submittedAt" timestamp without time zone,
    "verifiedBy" character varying,
    "verifiedAt" timestamp without time zone,
    "approvedBy" character varying,
    "approvedAt" timestamp without time zone,
    "rejectedBy" character varying,
    "rejectedAt" timestamp without time zone,
    "alasanReject" text,
    "spmId" uuid,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.spp OWNER TO sikancil_user;

--
-- Name: spp_rincian; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.spp_rincian (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "sppId" uuid NOT NULL,
    "kodeRekening" character varying(20) NOT NULL,
    uraian character varying(255) NOT NULL,
    volume numeric(10,2),
    satuan character varying(50),
    "hargaSatuan" numeric(15,2),
    jumlah numeric(15,2) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.spp_rincian OWNER TO sikancil_user;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "kodeSupplier" character varying(50) NOT NULL,
    "namaSupplier" character varying(255) NOT NULL,
    npwp character varying(100),
    alamat text,
    kota character varying(100),
    "kodePos" character varying(20),
    telepon character varying(50),
    email character varying(100),
    "contactPerson" character varying(255),
    "contactPhone" character varying(50),
    "bankName" character varying(255),
    "nomorRekening" character varying(100),
    "namaRekening" character varying(255),
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    catatan text,
    "createdBy" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.suppliers OWNER TO sikancil_user;

--
-- Name: surat_tanda_setoran; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.surat_tanda_setoran (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorSTS" character varying(100) NOT NULL,
    "tanggalSTS" timestamp without time zone NOT NULL,
    "namaPenyetor" character varying(255) NOT NULL,
    "alamatPenyetor" character varying(500),
    uraian text NOT NULL,
    jumlah numeric(15,2) NOT NULL,
    "kodeRekening" character varying(20) NOT NULL,
    "jenisPendapatan" character varying(100) NOT NULL,
    "bankTujuan" character varying(255),
    "rekeningTujuan" character varying(100),
    "tanggalSetor" timestamp without time zone,
    "buktiSetorPath" character varying(500),
    "nomorBKU" character varying(100),
    "journalId" uuid,
    "isPosted" boolean DEFAULT false NOT NULL,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.surat_tanda_setoran OWNER TO sikancil_user;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.system_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "settingKey" character varying(100) NOT NULL,
    "settingValue" text NOT NULL,
    "settingGroup" character varying(100) NOT NULL,
    deskripsi text,
    "isActive" boolean DEFAULT true NOT NULL,
    "updatedBy" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_settings OWNER TO sikancil_user;

--
-- Name: tax_transactions; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.tax_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "nomorBuktiPotong" character varying(100) NOT NULL,
    tanggal timestamp without time zone NOT NULL,
    "jenisPajak" character varying(50) NOT NULL,
    "namaWP" character varying(255) NOT NULL,
    npwp character varying(100) NOT NULL,
    dpp numeric(15,2) NOT NULL,
    tarif numeric(5,2) NOT NULL,
    "jumlahPajak" numeric(15,2) NOT NULL,
    "sppId" uuid,
    "isSetor" boolean DEFAULT false NOT NULL,
    "tanggalSetor" timestamp without time zone,
    "nomorNTPN" character varying(100),
    "journalId" uuid,
    "createdBy" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tax_transactions OWNER TO sikancil_user;

--
-- Name: term_pembayaran; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.term_pembayaran (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "kontrakId" uuid NOT NULL,
    "termKe" integer NOT NULL,
    persentase numeric(5,2) NOT NULL,
    nilai numeric(15,2) NOT NULL,
    "syaratPembayaran" text NOT NULL,
    "statusPembayaran" character varying(50) NOT NULL,
    "sppId" uuid,
    "tanggalBayar" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.term_pembayaran OWNER TO sikancil_user;

--
-- Name: unit_kerja; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.unit_kerja (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "kodeUnit" character varying(50) NOT NULL,
    "namaUnit" character varying(255) NOT NULL,
    "parentId" uuid,
    level integer DEFAULT 1 NOT NULL,
    "kepalaNama" character varying(255),
    "kepalaNIP" character varying(50),
    email character varying(100),
    telepon character varying(50),
    alamat text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.unit_kerja OWNER TO sikancil_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: sikancil_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    "fullName" character varying NOT NULL,
    nip character varying,
    jabatan character varying,
    role public.users_role_enum DEFAULT 'user'::public.users_role_enum NOT NULL,
    status public.users_status_enum DEFAULT 'active'::public.users_status_enum NOT NULL,
    phone character varying,
    blud_id character varying,
    avatar character varying,
    "lastLogin" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "createdBy" character varying,
    "updatedBy" character varying
);


ALTER TABLE public.users OWNER TO sikancil_user;

--
-- Data for Name: accounts_payable; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.accounts_payable (id, "nomorAP", tanggal, "tanggalJatuhTempo", "supplierId", "nomorInvoice", uraian, "nilaiHutang", "nilaiDibayar", "sisaHutang", status, "sppId", "journalId", "isPosted", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: accounts_receivable; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.accounts_receivable (id, "nomorAR", tanggal, "tanggalJatuhTempo", "namaDebitur", "nomorInvoice", uraian, "nilaiPiutang", "nilaiDiterima", "sisaPiutang", status, "journalId", "isPosted", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: addendum; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.addendum (id, "kontrakId", "nomorAddendum", "tanggalAddendum", "jenisPerubahan", "nilaiSebelum", "nilaiSesudah", "waktuSebelum", "waktuSesudah", "alasanPerubahan", "filePath", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: anggaran_kas; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.anggaran_kas (id, "rbaId", bulan, tahun, "saldoAwal", "penerimaanAPBD", "penerimaanFungsional", "penerimaanHibah", "penerimaanLain", "totalPenerimaan", "belanjaPegawai", "belanjaBarangJasa", "belanjaModal", "belanjaLain", "totalPengeluaran", "saldoAkhir", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: approval_logs; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.approval_logs (id, "documentType", "documentId", "documentNo", action, "previousStatus", "newStatus", comments, "performedBy", "ipAddress", "createdAt") FROM stdin;
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.bank_accounts (id, "kodeBank", "namaBank", "nomorRekening", "namaPemilik", cabang, swift, "saldoAwal", "saldoBerjalan", currency, "isPrimary", status, keterangan, "createdBy", "createdAt", "updatedAt") FROM stdin;
34cd9b22-85a8-4ea2-b197-803c1262897e	BNI-001	Bank Negara Indonesia	0123456789	RSUD Si-Kancil	Cabang Utama	\N	0.00	0.00	IDR	t	ACTIVE	\N	\N	2026-02-14 00:47:12.900308	2026-02-14 00:47:12.900308
11705ca3-703a-468e-8445-746c3fa9cd4a	BRI-001	Bank Rakyat Indonesia	9876543210	RSUD Si-Kancil	Cabang Kota	\N	0.00	0.00	IDR	f	ACTIVE	\N	\N	2026-02-14 00:47:12.90401	2026-02-14 00:47:12.90401
\.


--
-- Data for Name: bank_transactions; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.bank_transactions (id, "nomorTransaksi", tanggal, "bankAccountId", jenis, uraian, debit, credit, saldo, "referenceNo", "referenceType", "referenceId", "isReconciled", "reconciledAt", status, "journalId", "isPosted", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.budgets (id, "fiscalYearId", "kodeRekening", "unitKerjaId", "anggaranAwal", revisi, "anggaranAkhir", realisasi, sisa, status, keterangan, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: buku_kas_umum; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.buku_kas_umum (id, "nomorUrut", tanggal, jenis, uraian, "kodeRekening", penerimaan, pengeluaran, saldo, "referenceType", "referenceId", "referenceNo", "journalId", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: cash_transactions; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.cash_transactions (id, "nomorTransaksi", tanggal, jenis, uraian, jumlah, diterima_dari, dibayar_kepada, "unitKerjaId", status, "journalId", "isPosted", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: chart_of_accounts; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.chart_of_accounts (id, "kodeRekening", "namaRekening", "jenisAkun", level, "parentKode", "isActive", "isHeader", deskripsi, "normalBalance", "isBudgetControl", "createdBy", "createdAt", "updatedAt") FROM stdin;
2d77bb46-a7cd-4e1e-a505-642a4d645954	1	ASET	ASSET	1	\N	t	t	\N	DEBIT	f	\N	2026-02-14 00:47:12.656152	2026-02-14 00:47:12.656152
25a960ea-7fcb-4de0-949d-776e1ff781d3	1.1	ASET LANCAR	ASSET	2	1	t	t	\N	DEBIT	f	\N	2026-02-14 00:47:12.670008	2026-02-14 00:47:12.670008
869d6ee5-9bc8-4160-9463-18b7dea15690	1.1.1	Kas dan Setara Kas	ASSET	3	1.1	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.678918	2026-02-14 00:47:12.678918
0c0f1da2-b862-44b9-bcc4-b46a8736ca27	1.1.1.01	Kas	ASSET	4	1.1.1	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.685436	2026-02-14 00:47:12.685436
9f962ddc-ad7b-4a37-b57c-ec19760373d0	1.1.1.02	Bank - Rekening Utama	ASSET	4	1.1.1	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.697275	2026-02-14 00:47:12.697275
e95a53f0-c7fc-494f-8a01-673d6da57351	1.1.1.03	Bank - Rekening Operasional	ASSET	4	1.1.1	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.703175	2026-02-14 00:47:12.703175
0427e13d-b7e0-48e8-8fa9-5c6961dd553e	1.1.2	Piutang	ASSET	3	1.1	t	t	\N	DEBIT	f	\N	2026-02-14 00:47:12.709593	2026-02-14 00:47:12.709593
d17d1c57-14a0-4cb4-b0b1-3e89dda91a51	1.1.2.01	Piutang Usaha	ASSET	4	1.1.2	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.714637	2026-02-14 00:47:12.714637
ce245059-50d0-45e1-8698-b3f8173f0338	1.1.2.02	Piutang Lain-lain	ASSET	4	1.1.2	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.71976	2026-02-14 00:47:12.71976
1cb37fcc-931f-410d-939f-94312e8fb697	1.2	ASET TETAP	ASSET	2	1	t	t	\N	DEBIT	f	\N	2026-02-14 00:47:12.726196	2026-02-14 00:47:12.726196
d5c556a6-7d11-4e39-a8bd-777ef15b865e	1.2.1	Tanah	ASSET	3	1.2	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.731263	2026-02-14 00:47:12.731263
94630415-cdcc-430f-8f01-4435366dc340	1.2.2	Bangunan	ASSET	3	1.2	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.736916	2026-02-14 00:47:12.736916
98bf3ae8-ab24-49a9-9205-dfd630a134d1	1.2.3	Peralatan Medis	ASSET	3	1.2	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.747485	2026-02-14 00:47:12.747485
57b3828d-4a18-4237-973d-27b3dcf0a3fa	1.2.4	Kendaraan	ASSET	3	1.2	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.751019	2026-02-14 00:47:12.751019
e0fea80a-20e8-4db0-8010-95297a971a3e	1.2.5	Akumulasi Penyusutan	ASSET	3	1.2	t	f	\N	CREDIT	f	\N	2026-02-14 00:47:12.756202	2026-02-14 00:47:12.756202
2d93ebd7-c29d-4975-97c7-c50be30badba	2	KEWAJIBAN	LIABILITY	1	\N	t	t	\N	CREDIT	f	\N	2026-02-14 00:47:12.759649	2026-02-14 00:47:12.759649
4428a83d-dcb2-4700-b597-d70cc6dd29d2	2.1	KEWAJIBAN JANGKA PENDEK	LIABILITY	2	2	t	t	\N	CREDIT	f	\N	2026-02-14 00:47:12.76296	2026-02-14 00:47:12.76296
7f5fb72e-2ea3-4edb-b192-5c9e56cda5ef	2.1.1	Hutang Usaha	LIABILITY	3	2.1	t	f	\N	CREDIT	f	\N	2026-02-14 00:47:12.766784	2026-02-14 00:47:12.766784
21133e7f-6e82-4c15-beab-a8018152217f	2.1.2	Hutang Pajak	LIABILITY	3	2.1	t	t	\N	CREDIT	f	\N	2026-02-14 00:47:12.771882	2026-02-14 00:47:12.771882
44ba5f1d-0a9d-456e-846d-6704518fc05f	2.1.2.01	Hutang PPh 21	LIABILITY	4	2.1.2	t	f	\N	CREDIT	f	\N	2026-02-14 00:47:12.775724	2026-02-14 00:47:12.775724
4307d451-5800-426b-b378-03d6563270e8	2.1.2.02	Hutang PPh 23	LIABILITY	4	2.1.2	t	f	\N	CREDIT	f	\N	2026-02-14 00:47:12.779984	2026-02-14 00:47:12.779984
f487f8b5-a32a-4436-a49f-c6d3d4c08761	2.1.2.03	Hutang PPN	LIABILITY	4	2.1.2	t	f	\N	CREDIT	f	\N	2026-02-14 00:47:12.783527	2026-02-14 00:47:12.783527
ae9baa16-7264-4a09-93a5-ac898839d435	3	EKUITAS	EQUITY	1	\N	t	t	\N	CREDIT	f	\N	2026-02-14 00:47:12.787985	2026-02-14 00:47:12.787985
3f4429b5-d6b9-4e9e-bf7a-3b403ff23861	3.1	Ekuitas Awal	EQUITY	2	3	t	f	\N	CREDIT	f	\N	2026-02-14 00:47:12.791459	2026-02-14 00:47:12.791459
b897e256-b6c5-4698-9c15-ba747988a131	3.2	Surplus (Defisit) Tahun Berjalan	EQUITY	2	3	t	f	\N	CREDIT	f	\N	2026-02-14 00:47:12.795039	2026-02-14 00:47:12.795039
942d37e3-28a1-45f1-ad9b-1107bf69ebf6	4	PENDAPATAN	REVENUE	1	\N	t	t	\N	CREDIT	f	\N	2026-02-14 00:47:12.798652	2026-02-14 00:47:12.798652
6dee289a-6169-4519-acd7-a2fd08de3089	4.1	PENDAPATAN BLUD	REVENUE	2	4	t	t	\N	CREDIT	t	\N	2026-02-14 00:47:12.802909	2026-02-14 00:47:12.802909
438d2680-ad3c-4311-a134-470072d9cf28	4.1.1	Pendapatan APBD	REVENUE	3	4.1	t	f	\N	CREDIT	t	\N	2026-02-14 00:47:12.806197	2026-02-14 00:47:12.806197
43317aa6-be6f-4e4e-8951-9a6d40531592	4.1.2	Pendapatan Fungsional	REVENUE	3	4.1	t	t	\N	CREDIT	t	\N	2026-02-14 00:47:12.80951	2026-02-14 00:47:12.80951
dda555ef-01cf-48ef-86df-6dd6849f8c55	4.1.2.01	Pendapatan Layanan Rawat Jalan	REVENUE	4	4.1.2	t	f	\N	CREDIT	t	\N	2026-02-14 00:47:12.812491	2026-02-14 00:47:12.812491
7b55a70c-efda-4ccc-a6df-8f13af3857e3	4.1.2.02	Pendapatan Layanan Rawat Inap	REVENUE	4	4.1.2	t	f	\N	CREDIT	t	\N	2026-02-14 00:47:12.815578	2026-02-14 00:47:12.815578
15a780b0-0074-40ae-861b-87ab3b81313d	4.1.3	Pendapatan Hibah	REVENUE	3	4.1	t	f	\N	CREDIT	t	\N	2026-02-14 00:47:12.82004	2026-02-14 00:47:12.82004
6b23ff0d-17dc-4308-b6c1-c22ce2c3208c	5	BEBAN	EXPENSE	1	\N	t	t	\N	DEBIT	f	\N	2026-02-14 00:47:12.823182	2026-02-14 00:47:12.823182
46cb52c2-6f91-4308-ba97-25ec5576f677	5.1	BEBAN PEGAWAI	EXPENSE	2	5	t	t	\N	DEBIT	t	\N	2026-02-14 00:47:12.82601	2026-02-14 00:47:12.82601
d82da84a-1626-4a8e-ac58-79be3d3ddb59	5.1.1	Gaji Pokok	EXPENSE	3	5.1	t	f	\N	DEBIT	t	\N	2026-02-14 00:47:12.828931	2026-02-14 00:47:12.828931
097fc62f-30af-4b6b-92e0-f1010a4f8e38	5.1.2	Tunjangan	EXPENSE	3	5.1	t	f	\N	DEBIT	t	\N	2026-02-14 00:47:12.833233	2026-02-14 00:47:12.833233
a2199d3f-35b5-4eaa-866f-dc894f7cc76d	5.2	BEBAN BARANG DAN JASA	EXPENSE	2	5	t	t	\N	DEBIT	t	\N	2026-02-14 00:47:12.837109	2026-02-14 00:47:12.837109
738e27e8-6e98-4887-8b64-45e6b04f8021	5.2.1	Beban Obat dan Bahan Medis	EXPENSE	3	5.2	t	f	\N	DEBIT	t	\N	2026-02-14 00:47:12.842377	2026-02-14 00:47:12.842377
e139d81b-716e-41bb-9f24-744caf85ccc4	5.2.2	Beban Alat Tulis Kantor	EXPENSE	3	5.2	t	f	\N	DEBIT	t	\N	2026-02-14 00:47:12.84669	2026-02-14 00:47:12.84669
67491791-154d-419d-bfdc-5fe3e1cfef71	5.2.3	Beban Listrik dan Air	EXPENSE	3	5.2	t	f	\N	DEBIT	t	\N	2026-02-14 00:47:12.851601	2026-02-14 00:47:12.851601
8e52647b-5328-4a3b-a9c3-3d95fa150783	5.3	BEBAN MODAL	EXPENSE	2	5	t	t	\N	DEBIT	t	\N	2026-02-14 00:47:12.85534	2026-02-14 00:47:12.85534
8e9968fe-ff7c-4ff5-8318-bb8c15d9c84a	5.3.1	Beban Perolehan Peralatan Medis	EXPENSE	3	5.3	t	f	\N	DEBIT	t	\N	2026-02-14 00:47:12.858523	2026-02-14 00:47:12.858523
2e6a6c3b-954b-4708-9e3e-7cfdb036cbeb	5.3.2	Beban Perolehan Kendaraan	EXPENSE	3	5.3	t	f	\N	DEBIT	t	\N	2026-02-14 00:47:12.861277	2026-02-14 00:47:12.861277
e0b85848-1be5-4b83-85aa-2fa42cd47e5a	5.4	BEBAN LAIN-LAIN	EXPENSE	2	5	t	t	\N	DEBIT	f	\N	2026-02-14 00:47:12.86542	2026-02-14 00:47:12.86542
501dbedd-bf59-4f74-a1e8-ee4982b7561d	5.4.1	Beban Penyusutan	EXPENSE	3	5.4	t	f	\N	DEBIT	f	\N	2026-02-14 00:47:12.868149	2026-02-14 00:47:12.868149
\.


--
-- Data for Name: depreciation_schedules; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.depreciation_schedules (id, "assetId", tahun, bulan, "nilaiAwal", "bebanDepresiasi", "akumulasiDepresiasi", "nilaiBuku", "isPosted", "journalId", "createdAt") FROM stdin;
\.


--
-- Data for Name: dokumen_spp; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.dokumen_spp (id, "sppId", "namaDokumen", "jenisDokumen", "filePath", "fileSize", "uploadedBy", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: fiscal_years; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.fiscal_years (id, tahun, "tanggalMulai", "tanggalSelesai", status, "isCurrent", keterangan, "createdBy", "createdAt", "updatedAt") FROM stdin;
19c35424-9a63-4f4d-9819-38cba5aabc94	2025	2025-01-01	2025-12-31	CLOSED	f	Tahun Anggaran 2025	\N	2026-02-14 00:47:12.889149	2026-02-14 00:47:12.889149
b0fd0957-a790-4e9c-aa2e-34a65dfa32ff	2026	2026-01-01	2026-12-31	OPEN	t	Tahun Anggaran 2026	\N	2026-02-14 00:47:12.893366	2026-02-14 00:47:12.893366
3d56f823-1f6d-4ce3-8140-3d7a97b7cc54	2027	2027-01-01	2027-12-31	OPEN	f	Tahun Anggaran 2027	\N	2026-02-14 00:47:12.896441	2026-02-14 00:47:12.896441
\.


--
-- Data for Name: fixed_assets; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.fixed_assets (id, "kodeAset", "namaAset", kategori, deskripsi, "unitKerjaId", lokasi, "tanggalPerolehan", "nilaiPerolehan", supplier, "metodeDepresiasi", "umurEkonomis", "nilaiResidu", "akumulasiDepresiasi", "nilaiBuku", status, "tanggalDisposal", "nilaiDisposal", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: journal_details; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.journal_details (id, "journalId", "lineNumber", "kodeRekening", deskripsi, "unitKerjaId", debit, credit, "createdAt") FROM stdin;
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.journal_entries (id, "nomorJurnal", "tanggalJurnal", "jenisJurnal", "referenceType", "referenceId", "referenceNo", deskripsi, "totalDebit", "totalCredit", status, "postedBy", "postedAt", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: kontrak_pengadaan; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.kontrak_pengadaan (id, "nomorKontrak", "tanggalKontrak", "vendorId", "namaVendor", "npwpVendor", "jenisPengadaan", "metodePengadaan", "nilaiKontrak", "tahunAnggaran", "kodeRekening", "tanggalMulai", "tanggalSelesai", "progresRealisasi", "totalDibayar", "sisaKontrak", status, "filePath", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payroll; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.payroll (id, "nomorPayroll", bulan, tahun, "pegawaiId", "gajiPokok", "tunjanganJabatan", "tunjanganKinerja", "tunjanganLain", "totalPenghasilan", pph21, "iuranPensiun", bpjs, "potonganLain", "totalPotongan", "gajiNetto", status, "sppId", "journalId", "isPosted", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: pegawai; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.pegawai (id, nip, "namaLengkap", "unitKerjaId", jabatan, golongan, email, telepon, npwp, "bankName", "nomorRekening", "namaRekening", "tanggalMasuk", status, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: pendapatan_blud; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.pendapatan_blud (id, "nomorBukti", tanggal, "sumberDana", "kategoriPendapatan", uraian, jumlah, "simrsReferenceId", "simrsData", "nomorSP2D", "tanggalSP2D", "pemberiHibah", "nomorSKHibah", "tanggalSKHibah", disetor, "tanggalSetor", "nomorSTS", "nomorBKU", "journalId", "isPosted", "unitKerjaId", status, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rba; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.rba (id, kode, "tahunAnggaran", status, "revisiKe", visi, misi, tujuan, "targetOutput", iku, "proyeksiPendapatan", "proyeksiBelanja", "proyeksiPembiayaan", "tanggalPenyusunan", "tanggalApproval", "approvedBy", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rba_belanja; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.rba_belanja (id, "rbaId", "kodeRekening", uraian, "jenisBelanja", tw1, tw2, tw3, tw4, "totalProyeksi", keterangan, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rba_pembiayaan; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.rba_pembiayaan (id, "rbaId", jenis, "kodeRekening", uraian, nilai, keterangan, "createdAt") FROM stdin;
\.


--
-- Data for Name: rba_pendapatan; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.rba_pendapatan (id, "rbaId", "kodeRekening", uraian, "sumberDana", tw1, tw2, tw3, tw4, "totalProyeksi", keterangan, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: revisi_rba; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.revisi_rba (id, "rbaId", "revisiKe", "tanggalRevisi", "alasanRevisi", "perubahanData", "approvedBy", "approvedAt", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: sp2d; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.sp2d (id, "nomorSP2D", "tanggalSP2D", "nilaiSP2D", "tanggalCair", "statusCair", "bankPencairan", "nomorReferensi", "approvedBy", "approvedAt", "ttdDigital", "nomorBKU", "isPosted", "journalId", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: spm; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.spm (id, "nomorSPM", "tanggalSPM", "nilaiSPM", "namaPenerima", "nomorRekening", "namaBank", status, "approvedBy", "approvedAt", "ttdDigital", "sp2dId", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: spp; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.spp (id, "nomorSPP", "tanggalSPP", "jenisSPP", "tahunAnggaran", "unitKerjaId", "pengajuId", "nilaiSPP", uraian, pph21, pph22, pph23, ppn, "totalPajak", "nilaiBersih", "namaPenerima", "npwpPenerima", "bankPenerima", "rekeningPenerima", "kontrakId", status, "submittedBy", "submittedAt", "verifiedBy", "verifiedAt", "approvedBy", "approvedAt", "rejectedBy", "rejectedAt", "alasanReject", "spmId", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: spp_rincian; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.spp_rincian (id, "sppId", "kodeRekening", uraian, volume, satuan, "hargaSatuan", jumlah, "createdAt") FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.suppliers (id, "kodeSupplier", "namaSupplier", npwp, alamat, kota, "kodePos", telepon, email, "contactPerson", "contactPhone", "bankName", "nomorRekening", "namaRekening", status, catatan, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: surat_tanda_setoran; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.surat_tanda_setoran (id, "nomorSTS", "tanggalSTS", "namaPenyetor", "alamatPenyetor", uraian, jumlah, "kodeRekening", "jenisPendapatan", "bankTujuan", "rekeningTujuan", "tanggalSetor", "buktiSetorPath", "nomorBKU", "journalId", "isPosted", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.system_settings (id, "settingKey", "settingValue", "settingGroup", deskripsi, "isActive", "updatedBy", "createdAt", "updatedAt") FROM stdin;
80e2af3e-2867-493d-bdd6-66e1b465b94f	ORGANIZATION_NAME	RSUD Si-Kancil	GENERAL	Nama organisasi/rumah sakit	t	\N	2026-02-14 00:47:12.907332	2026-02-14 00:47:12.907332
77d012c2-4005-400d-867a-21ff453e63bd	ORGANIZATION_ADDRESS	Jl. Kesehatan No. 123, Kota Sehat	GENERAL	Alamat organisasi	t	\N	2026-02-14 00:47:12.910698	2026-02-14 00:47:12.910698
917df5a9-91b1-4c71-aa1c-7bad12ba2633	CURRENT_FISCAL_YEAR	2026	BLUD	Tahun anggaran aktif	t	\N	2026-02-14 00:47:12.91325	2026-02-14 00:47:12.91325
f125ef1a-2007-4574-9d07-0f5d51be8598	AUTO_POSTING_ENABLED	true	ACCOUNTING	Aktifkan posting jurnal otomatis	t	\N	2026-02-14 00:47:12.916068	2026-02-14 00:47:12.916068
602b96b4-0d49-4a7a-a306-9bc549c5de64	BKU_AUTO_NUMBER	true	BLUD	Aktifkan penomoran BKU otomatis	t	\N	2026-02-14 00:47:12.918625	2026-02-14 00:47:12.918625
\.


--
-- Data for Name: tax_transactions; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.tax_transactions (id, "nomorBuktiPotong", tanggal, "jenisPajak", "namaWP", npwp, dpp, tarif, "jumlahPajak", "sppId", "isSetor", "tanggalSetor", "nomorNTPN", "journalId", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: term_pembayaran; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.term_pembayaran (id, "kontrakId", "termKe", persentase, nilai, "syaratPembayaran", "statusPembayaran", "sppId", "tanggalBayar", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: unit_kerja; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.unit_kerja (id, "kodeUnit", "namaUnit", "parentId", level, "kepalaNama", "kepalaNIP", email, telepon, alamat, "isActive", "createdBy", "createdAt", "updatedAt") FROM stdin;
f945273f-204d-4961-a0ef-ab8680665bd6	ROOT	RSUD Si-Kancil	\N	1	\N	\N	\N	\N	\N	t	\N	2026-02-14 00:47:12.872078	2026-02-14 00:47:12.872078
02265116-f7de-4066-b3e8-9ca45b216407	DIR	Direktorat	\N	2	\N	\N	\N	\N	\N	t	\N	2026-02-14 00:47:12.875636	2026-02-14 00:47:12.875636
fd94eab3-ca44-4a5e-8a1b-f912a5b82ef4	KEU	Bagian Keuangan	\N	2	\N	\N	\N	\N	\N	t	\N	2026-02-14 00:47:12.878309	2026-02-14 00:47:12.878309
e4bd497e-973d-42a2-932f-562db49464e8	MED	Bagian Pelayanan Medis	\N	2	\N	\N	\N	\N	\N	t	\N	2026-02-14 00:47:12.881083	2026-02-14 00:47:12.881083
81a4a365-0a99-4fc5-b415-a023aced7533	UMU	Bagian Umum	\N	2	\N	\N	\N	\N	\N	t	\N	2026-02-14 00:47:12.885515	2026-02-14 00:47:12.885515
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sikancil_user
--

COPY public.users (id, username, email, password, "fullName", nip, jabatan, role, status, phone, blud_id, avatar, "lastLogin", "createdAt", "updatedAt", "deletedAt", "createdBy", "updatedBy") FROM stdin;
3a3c5497-3709-4f7e-be35-0d303cb00f3c	admin	admin@sikancil.id	$2b$10$zP/yrdjtPVmZ8uEpPzFA8uu6DVjpcZRlWT9gZPV.DWKsAaX69c5z6	Administrator Si-Kancil	\N	\N	user	active	\N	\N	\N	2026-02-13 23:43:56.387	2026-02-13 23:43:48.642422	2026-02-13 23:43:56.390964	\N	\N	\N
\.


--
-- Name: revisi_rba PK_01ebf7d360fa87c1a0ab9fbdabc; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.revisi_rba
    ADD CONSTRAINT "PK_01ebf7d360fa87c1a0ab9fbdabc" PRIMARY KEY (id);


--
-- Name: fiscal_years PK_0470d6bc5c757d488b7b04e1899; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.fiscal_years
    ADD CONSTRAINT "PK_0470d6bc5c757d488b7b04e1899" PRIMARY KEY (id);


--
-- Name: spp PK_0ca3cbab985bf25729747284cf4; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.spp
    ADD CONSTRAINT "PK_0ca3cbab985bf25729747284cf4" PRIMARY KEY (id);


--
-- Name: bank_transactions PK_123cc87304eefb2c497b4acdd10; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT "PK_123cc87304eefb2c497b4acdd10" PRIMARY KEY (id);


--
-- Name: term_pembayaran PK_1677411d6ccb04af65b2eaa396a; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.term_pembayaran
    ADD CONSTRAINT "PK_1677411d6ccb04af65b2eaa396a" PRIMARY KEY (id);


--
-- Name: addendum PK_1c2f63d714beb03629fc82dcb52; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.addendum
    ADD CONSTRAINT "PK_1c2f63d714beb03629fc82dcb52" PRIMARY KEY (id);


--
-- Name: anggaran_kas PK_34989ff452209d646b097b2ba74; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.anggaran_kas
    ADD CONSTRAINT "PK_34989ff452209d646b097b2ba74" PRIMARY KEY (id);


--
-- Name: journal_details PK_3fa4de803daedc9c07ee2d41d9b; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.journal_details
    ADD CONSTRAINT "PK_3fa4de803daedc9c07ee2d41d9b" PRIMARY KEY (id);


--
-- Name: chart_of_accounts PK_467c08a2efc78393c647da32bac; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT "PK_467c08a2efc78393c647da32bac" PRIMARY KEY (id);


--
-- Name: rba_pembiayaan PK_5cc8e7ec797c2d19af2022fb123; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.rba_pembiayaan
    ADD CONSTRAINT "PK_5cc8e7ec797c2d19af2022fb123" PRIMARY KEY (id);


--
-- Name: approval_logs PK_5ea530f8eff8a9e5e143c3b60be; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.approval_logs
    ADD CONSTRAINT "PK_5ea530f8eff8a9e5e143c3b60be" PRIMARY KEY (id);


--
-- Name: surat_tanda_setoran PK_6cd91b8f9be611495899f178bf1; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.surat_tanda_setoran
    ADD CONSTRAINT "PK_6cd91b8f9be611495899f178bf1" PRIMARY KEY (id);


--
-- Name: accounts_receivable PK_7a4fd7cf394ef2c2abfed284d9e; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.accounts_receivable
    ADD CONSTRAINT "PK_7a4fd7cf394ef2c2abfed284d9e" PRIMARY KEY (id);


--
-- Name: payroll PK_7a76b819506029fc535b6e002e0; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT "PK_7a76b819506029fc535b6e002e0" PRIMARY KEY (id);


--
-- Name: system_settings PK_82521f08790d248b2a80cc85d40; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT "PK_82521f08790d248b2a80cc85d40" PRIMARY KEY (id);


--
-- Name: pegawai PK_8709c75473217f0437909a47705; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.pegawai
    ADD CONSTRAINT "PK_8709c75473217f0437909a47705" PRIMARY KEY (id);


--
-- Name: pendapatan_blud PK_87471eb3379931ec2f5d9666d0e; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.pendapatan_blud
    ADD CONSTRAINT "PK_87471eb3379931ec2f5d9666d0e" PRIMARY KEY (id);


--
-- Name: sp2d PK_89bc7601db9e396646cf33e1152; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.sp2d
    ADD CONSTRAINT "PK_89bc7601db9e396646cf33e1152" PRIMARY KEY (id);


--
-- Name: rba_belanja PK_8e13ab1f4ce0d57ffb657f7f5d9; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.rba_belanja
    ADD CONSTRAINT "PK_8e13ab1f4ce0d57ffb657f7f5d9" PRIMARY KEY (id);


--
-- Name: fixed_assets PK_901984c25ddf1dcf11f1c7a70d8; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT "PK_901984c25ddf1dcf11f1c7a70d8" PRIMARY KEY (id);


--
-- Name: spm PK_9476e3ca96efc894528663168db; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.spm
    ADD CONSTRAINT "PK_9476e3ca96efc894528663168db" PRIMARY KEY (id);


--
-- Name: kontrak_pengadaan PK_982be0b62e42566f1cc4ec16139; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.kontrak_pengadaan
    ADD CONSTRAINT "PK_982be0b62e42566f1cc4ec16139" PRIMARY KEY (id);


--
-- Name: budgets PK_9c8a51748f82387644b773da482; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT "PK_9c8a51748f82387644b773da482" PRIMARY KEY (id);


--
-- Name: rba PK_9ff3ab30e1e05e6646a19e23343; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.rba
    ADD CONSTRAINT "PK_9ff3ab30e1e05e6646a19e23343" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: tax_transactions PK_a5ec540fc13668a2ffcf09b082c; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.tax_transactions
    ADD CONSTRAINT "PK_a5ec540fc13668a2ffcf09b082c" PRIMARY KEY (id);


--
-- Name: journal_entries PK_a70368e64230434457c8d007ab3; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "PK_a70368e64230434457c8d007ab3" PRIMARY KEY (id);


--
-- Name: spp_rincian PK_a80ad0df55839749187b837c1dc; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.spp_rincian
    ADD CONSTRAINT "PK_a80ad0df55839749187b837c1dc" PRIMARY KEY (id);


--
-- Name: dokumen_spp PK_a8ac1f6ac9f0db4d8ba1e1864b5; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.dokumen_spp
    ADD CONSTRAINT "PK_a8ac1f6ac9f0db4d8ba1e1864b5" PRIMARY KEY (id);


--
-- Name: suppliers PK_b70ac51766a9e3144f778cfe81e; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY (id);


--
-- Name: bank_accounts PK_c872de764f2038224a013ff25ed; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY (id);


--
-- Name: accounts_payable PK_d4579aa8c6efa870a8ced890861; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.accounts_payable
    ADD CONSTRAINT "PK_d4579aa8c6efa870a8ced890861" PRIMARY KEY (id);


--
-- Name: cash_transactions PK_df7299c9dda9bf4b78d874e588e; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "PK_df7299c9dda9bf4b78d874e588e" PRIMARY KEY (id);


--
-- Name: unit_kerja PK_e130ce6a44b06df6abec8b77900; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.unit_kerja
    ADD CONSTRAINT "PK_e130ce6a44b06df6abec8b77900" PRIMARY KEY (id);


--
-- Name: depreciation_schedules PK_f7d967d218b3fc888c6b55041be; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.depreciation_schedules
    ADD CONSTRAINT "PK_f7d967d218b3fc888c6b55041be" PRIMARY KEY (id);


--
-- Name: rba_pendapatan PK_f9b9ddf79825b883d38dec4f983; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.rba_pendapatan
    ADD CONSTRAINT "PK_f9b9ddf79825b883d38dec4f983" PRIMARY KEY (id);


--
-- Name: buku_kas_umum PK_fa8d29d2bf08356cedc08891609; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.buku_kas_umum
    ADD CONSTRAINT "PK_fa8d29d2bf08356cedc08891609" PRIMARY KEY (id);


--
-- Name: accounts_payable UQ_00cbe7f8587155e63c474bd4996; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.accounts_payable
    ADD CONSTRAINT "UQ_00cbe7f8587155e63c474bd4996" UNIQUE ("nomorAP");


--
-- Name: cash_transactions UQ_0c3b02673c408b5f7741238585f; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "UQ_0c3b02673c408b5f7741238585f" UNIQUE ("nomorTransaksi");


--
-- Name: pendapatan_blud UQ_1511bc46ea05bf6e8509f2a6ecb; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.pendapatan_blud
    ADD CONSTRAINT "UQ_1511bc46ea05bf6e8509f2a6ecb" UNIQUE ("nomorBukti");


--
-- Name: sp2d UQ_1d5066b96992f298c83b599ceea; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.sp2d
    ADD CONSTRAINT "UQ_1d5066b96992f298c83b599ceea" UNIQUE ("nomorSP2D");


--
-- Name: kontrak_pengadaan UQ_2035b89425a0ffa338f826bbff4; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.kontrak_pengadaan
    ADD CONSTRAINT "UQ_2035b89425a0ffa338f826bbff4" UNIQUE ("nomorKontrak");


--
-- Name: spp UQ_207366411d244dc5b8cdd9b2c95; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.spp
    ADD CONSTRAINT "UQ_207366411d244dc5b8cdd9b2c95" UNIQUE ("nomorSPP");


--
-- Name: tax_transactions UQ_2c27b5dab800e421eb37b806b0a; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.tax_transactions
    ADD CONSTRAINT "UQ_2c27b5dab800e421eb37b806b0a" UNIQUE ("nomorBuktiPotong");


--
-- Name: journal_entries UQ_2cd056e3936001386d501fdc7fe; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "UQ_2cd056e3936001386d501fdc7fe" UNIQUE ("nomorJurnal");


--
-- Name: accounts_receivable UQ_300464011848017031e05b0e3cc; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.accounts_receivable
    ADD CONSTRAINT "UQ_300464011848017031e05b0e3cc" UNIQUE ("nomorAR");


--
-- Name: spm UQ_48c01644e13009742afeaee40ce; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.spm
    ADD CONSTRAINT "UQ_48c01644e13009742afeaee40ce" UNIQUE ("nomorSPM");


--
-- Name: system_settings UQ_62505774632b6cf75db1c720982; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT "UQ_62505774632b6cf75db1c720982" UNIQUE ("settingKey");


--
-- Name: buku_kas_umum UQ_67fa60199f7b973ac15c4800740; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.buku_kas_umum
    ADD CONSTRAINT "UQ_67fa60199f7b973ac15c4800740" UNIQUE ("nomorUrut");


--
-- Name: fiscal_years UQ_769844646c2e5323314bd428277; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.fiscal_years
    ADD CONSTRAINT "UQ_769844646c2e5323314bd428277" UNIQUE (tahun);


--
-- Name: bank_transactions UQ_7b04fedb3b7dc9aa8aa68332104; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT "UQ_7b04fedb3b7dc9aa8aa68332104" UNIQUE ("nomorTransaksi");


--
-- Name: rba UQ_846124df8125e69a90af9c76f14; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.rba
    ADD CONSTRAINT "UQ_846124df8125e69a90af9c76f14" UNIQUE (kode);


--
-- Name: payroll UQ_85c5fb3397a781d5347b5f49302; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT "UQ_85c5fb3397a781d5347b5f49302" UNIQUE ("nomorPayroll");


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: surat_tanda_setoran UQ_a32aa6168ef25d0b8c6c01fd7d3; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.surat_tanda_setoran
    ADD CONSTRAINT "UQ_a32aa6168ef25d0b8c6c01fd7d3" UNIQUE ("journalId");


--
-- Name: bank_accounts UQ_b079ebe5337ac8d08e99a04fcdc; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT "UQ_b079ebe5337ac8d08e99a04fcdc" UNIQUE ("kodeBank");


--
-- Name: chart_of_accounts UQ_ba05cd4205bda2605f32e09b750; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT "UQ_ba05cd4205bda2605f32e09b750" UNIQUE ("kodeRekening");


--
-- Name: sp2d UQ_c0f8fdaba79271e87e87574288a; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.sp2d
    ADD CONSTRAINT "UQ_c0f8fdaba79271e87e87574288a" UNIQUE ("journalId");


--
-- Name: unit_kerja UQ_c4a039fff345de37d957a8fb5e7; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.unit_kerja
    ADD CONSTRAINT "UQ_c4a039fff345de37d957a8fb5e7" UNIQUE ("kodeUnit");


--
-- Name: anggaran_kas UQ_cfcb950976bf640078ebd15e3ea; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.anggaran_kas
    ADD CONSTRAINT "UQ_cfcb950976bf640078ebd15e3ea" UNIQUE ("rbaId", tahun, bulan);


--
-- Name: pendapatan_blud UQ_d3cf24408f38ac79f227e8eda55; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.pendapatan_blud
    ADD CONSTRAINT "UQ_d3cf24408f38ac79f227e8eda55" UNIQUE ("journalId");


--
-- Name: fixed_assets UQ_e77aeafb7b9f4a52d561583181f; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT "UQ_e77aeafb7b9f4a52d561583181f" UNIQUE ("kodeAset");


--
-- Name: surat_tanda_setoran UQ_ea4405485da13c98c3487213ca2; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.surat_tanda_setoran
    ADD CONSTRAINT "UQ_ea4405485da13c98c3487213ca2" UNIQUE ("nomorSTS");


--
-- Name: suppliers UQ_f41c2a479342bc709a74be5c4d2; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "UQ_f41c2a479342bc709a74be5c4d2" UNIQUE ("kodeSupplier");


--
-- Name: pegawai UQ_f454b349bbcb3af42f2d7fc8a7c; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.pegawai
    ADD CONSTRAINT "UQ_f454b349bbcb3af42f2d7fc8a7c" UNIQUE (nip);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: IDX_00cbe7f8587155e63c474bd499; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_00cbe7f8587155e63c474bd499" ON public.accounts_payable USING btree ("nomorAP");


--
-- Name: IDX_02f6633ce971d80e9ca71a5832; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_02f6633ce971d80e9ca71a5832" ON public.payroll USING btree (bulan);


--
-- Name: IDX_0a54a9ff3413f73e390ebc569d; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_0a54a9ff3413f73e390ebc569d" ON public.kontrak_pengadaan USING btree (status);


--
-- Name: IDX_0c3b02673c408b5f7741238585; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_0c3b02673c408b5f7741238585" ON public.cash_transactions USING btree ("nomorTransaksi");


--
-- Name: IDX_0d293e7735536434c9e94a5416; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_0d293e7735536434c9e94a5416" ON public.fixed_assets USING btree ("unitKerjaId");


--
-- Name: IDX_0d611b056a4543ff95d81446ad; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_0d611b056a4543ff95d81446ad" ON public.bank_transactions USING btree (tanggal);


--
-- Name: IDX_0fce48a33392329bdfcd61612d; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_0fce48a33392329bdfcd61612d" ON public.rba USING btree ("tahunAnggaran");


--
-- Name: IDX_13b98a6d96f6d2fd8275b475f2; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_13b98a6d96f6d2fd8275b475f2" ON public.spp_rincian USING btree ("sppId");


--
-- Name: IDX_13c86eee75960d1543ec18828a; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_13c86eee75960d1543ec18828a" ON public.accounts_receivable USING btree (tanggal);


--
-- Name: IDX_1511bc46ea05bf6e8509f2a6ec; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_1511bc46ea05bf6e8509f2a6ec" ON public.pendapatan_blud USING btree ("nomorBukti");


--
-- Name: IDX_17d0db9984bfe5444d1f2fa631; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_17d0db9984bfe5444d1f2fa631" ON public.anggaran_kas USING btree (tahun);


--
-- Name: IDX_1bdd8eb71d70cd7e0bedee98da; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_1bdd8eb71d70cd7e0bedee98da" ON public.sp2d USING btree ("nomorBKU");


--
-- Name: IDX_1d5066b96992f298c83b599cee; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_1d5066b96992f298c83b599cee" ON public.sp2d USING btree ("nomorSP2D");


--
-- Name: IDX_2035b89425a0ffa338f826bbff; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_2035b89425a0ffa338f826bbff" ON public.kontrak_pengadaan USING btree ("nomorKontrak");


--
-- Name: IDX_207366411d244dc5b8cdd9b2c9; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_207366411d244dc5b8cdd9b2c9" ON public.spp USING btree ("nomorSPP");


--
-- Name: IDX_23d4e76ba85b3dbf7819b88b18; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_23d4e76ba85b3dbf7819b88b18" ON public.budgets USING btree ("unitKerjaId");


--
-- Name: IDX_2693652508d2c804ef18f995a6; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_2693652508d2c804ef18f995a6" ON public.accounts_payable USING btree ("supplierId");


--
-- Name: IDX_2b628710b949df12f059cf7235; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_2b628710b949df12f059cf7235" ON public.pendapatan_blud USING btree (tanggal);


--
-- Name: IDX_2c27b5dab800e421eb37b806b0; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_2c27b5dab800e421eb37b806b0" ON public.tax_transactions USING btree ("nomorBuktiPotong");


--
-- Name: IDX_2cd056e3936001386d501fdc7f; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_2cd056e3936001386d501fdc7f" ON public.journal_entries USING btree ("nomorJurnal");


--
-- Name: IDX_2fa811f23005d5c9646ec6665f; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_2fa811f23005d5c9646ec6665f" ON public.spp USING btree ("tanggalSPP");


--
-- Name: IDX_300464011848017031e05b0e3c; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_300464011848017031e05b0e3c" ON public.accounts_receivable USING btree ("nomorAR");


--
-- Name: IDX_307c86daa8dd63f07d683a2da5; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_307c86daa8dd63f07d683a2da5" ON public.tax_transactions USING btree ("jenisPajak");


--
-- Name: IDX_38be9f7a7c8c802551cedd2cca; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_38be9f7a7c8c802551cedd2cca" ON public.rba USING btree (status);


--
-- Name: IDX_413e0376b4c5a0413a4ad287a6; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_413e0376b4c5a0413a4ad287a6" ON public.addendum USING btree ("kontrakId");


--
-- Name: IDX_48c01644e13009742afeaee40c; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_48c01644e13009742afeaee40c" ON public.spm USING btree ("nomorSPM");


--
-- Name: IDX_4ca245754b4135cbe181030731; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_4ca245754b4135cbe181030731" ON public.journal_details USING btree ("journalId");


--
-- Name: IDX_4ce0733d7b7345978801587fe7; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_4ce0733d7b7345978801587fe7" ON public.unit_kerja USING btree ("parentId");


--
-- Name: IDX_4dcce4ead319a2a28cff446e14; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_4dcce4ead319a2a28cff446e14" ON public.term_pembayaran USING btree ("kontrakId");


--
-- Name: IDX_4e86b614c91c763bb372296563; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_4e86b614c91c763bb372296563" ON public.sp2d USING btree ("tanggalSP2D");


--
-- Name: IDX_54b8f87d9b643fa6b70a6221c7; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_54b8f87d9b643fa6b70a6221c7" ON public.payroll USING btree ("pegawaiId");


--
-- Name: IDX_577a4b4746be1a86337345ed94; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_577a4b4746be1a86337345ed94" ON public.revisi_rba USING btree ("rbaId");


--
-- Name: IDX_598e06d1e5811b724f82ee7360; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_598e06d1e5811b724f82ee7360" ON public.kontrak_pengadaan USING btree ("tahunAnggaran");


--
-- Name: IDX_5fc4cb50164d79ce89df142cce; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_5fc4cb50164d79ce89df142cce" ON public.spp USING btree (status);


--
-- Name: IDX_60cdc75cf050444822bd78992a; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_60cdc75cf050444822bd78992a" ON public.rba_belanja USING btree ("rbaId");


--
-- Name: IDX_613375c9c5d257ef3187651f15; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_613375c9c5d257ef3187651f15" ON public.journal_details USING btree ("kodeRekening");


--
-- Name: IDX_61761c87ba2cbfdc67b0e3d32d; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_61761c87ba2cbfdc67b0e3d32d" ON public.rba_pendapatan USING btree ("rbaId");


--
-- Name: IDX_62505774632b6cf75db1c72098; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_62505774632b6cf75db1c72098" ON public.system_settings USING btree ("settingKey");


--
-- Name: IDX_67fa60199f7b973ac15c480074; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_67fa60199f7b973ac15c480074" ON public.buku_kas_umum USING btree ("nomorUrut");


--
-- Name: IDX_69c71348831a05b2e902a839e9; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_69c71348831a05b2e902a839e9" ON public.pendapatan_blud USING btree ("nomorBKU");


--
-- Name: IDX_6bd0e6399af633e93d16eb7a85; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_6bd0e6399af633e93d16eb7a85" ON public.rba_pembiayaan USING btree ("rbaId");


--
-- Name: IDX_6e2b118f355c0c23ee68a67677; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_6e2b118f355c0c23ee68a67677" ON public.buku_kas_umum USING btree (jenis);


--
-- Name: IDX_6f8f5a9446f24831238616b77a; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_6f8f5a9446f24831238616b77a" ON public.chart_of_accounts USING btree ("parentKode");


--
-- Name: IDX_769844646c2e5323314bd42827; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_769844646c2e5323314bd42827" ON public.fiscal_years USING btree (tahun);


--
-- Name: IDX_76a32d54203b7646ad967f55c9; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_76a32d54203b7646ad967f55c9" ON public.chart_of_accounts USING btree ("jenisAkun");


--
-- Name: IDX_77df3b59a791be1df5acf54715; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_77df3b59a791be1df5acf54715" ON public.tax_transactions USING btree (tanggal);


--
-- Name: IDX_7b04fedb3b7dc9aa8aa6833210; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_7b04fedb3b7dc9aa8aa6833210" ON public.bank_transactions USING btree ("nomorTransaksi");


--
-- Name: IDX_83b366fe9dabe3873f855b2c77; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_83b366fe9dabe3873f855b2c77" ON public.pegawai USING btree ("unitKerjaId");


--
-- Name: IDX_846124df8125e69a90af9c76f1; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_846124df8125e69a90af9c76f1" ON public.rba USING btree (kode);


--
-- Name: IDX_85c5fb3397a781d5347b5f4930; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_85c5fb3397a781d5347b5f4930" ON public.payroll USING btree ("nomorPayroll");


--
-- Name: IDX_87629e2236fb074d87043fa3f1; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_87629e2236fb074d87043fa3f1" ON public.rba_pendapatan USING btree ("kodeRekening");


--
-- Name: IDX_8870beededeb42b13f5216b573; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_8870beededeb42b13f5216b573" ON public.budgets USING btree ("fiscalYearId");


--
-- Name: IDX_89ca33753af44ac86e4164968e; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_89ca33753af44ac86e4164968e" ON public.budgets USING btree (status);


--
-- Name: IDX_97481a766e69ed1e131f116d6a; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_97481a766e69ed1e131f116d6a" ON public.accounts_payable USING btree (status);


--
-- Name: IDX_994d9d5a3d973d5bedbce892fb; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_994d9d5a3d973d5bedbce892fb" ON public.depreciation_schedules USING btree ("assetId");


--
-- Name: IDX_9a5edb6c1b64e8c1c56a213cea; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_9a5edb6c1b64e8c1c56a213cea" ON public.fixed_assets USING btree (status);


--
-- Name: IDX_9b8732f8549da2bfe064aab65b; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_9b8732f8549da2bfe064aab65b" ON public.spm USING btree ("tanggalSPM");


--
-- Name: IDX_a1bd378989ffb7afb4b6ac312c; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_a1bd378989ffb7afb4b6ac312c" ON public.payroll USING btree (tahun);


--
-- Name: IDX_a39786335721ba18d51e5be9a2; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_a39786335721ba18d51e5be9a2" ON public.surat_tanda_setoran USING btree ("tanggalSTS");


--
-- Name: IDX_a4401d433b1039c1d5a73935ec; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_a4401d433b1039c1d5a73935ec" ON public.approval_logs USING btree ("documentId");


--
-- Name: IDX_a571dac028ad21caa6a64f09ff; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_a571dac028ad21caa6a64f09ff" ON public.approval_logs USING btree ("documentType");


--
-- Name: IDX_a8573c945f2c066c11b1ed39ef; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_a8573c945f2c066c11b1ed39ef" ON public.accounts_payable USING btree (tanggal);


--
-- Name: IDX_adc28730e7a4ce909c04326ab7; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_adc28730e7a4ce909c04326ab7" ON public.pendapatan_blud USING btree ("sumberDana");


--
-- Name: IDX_b079ebe5337ac8d08e99a04fcd; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_b079ebe5337ac8d08e99a04fcd" ON public.bank_accounts USING btree ("kodeBank");


--
-- Name: IDX_b122f20b6bc917803a0b75565e; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_b122f20b6bc917803a0b75565e" ON public.bank_transactions USING btree (status);


--
-- Name: IDX_b558d413fd55c78fc67ad9a130; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_b558d413fd55c78fc67ad9a130" ON public.accounts_receivable USING btree (status);


--
-- Name: IDX_ba05cd4205bda2605f32e09b75; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_ba05cd4205bda2605f32e09b75" ON public.chart_of_accounts USING btree ("kodeRekening");


--
-- Name: IDX_bdc5d8f3b64b200e7519d0ebe0; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_bdc5d8f3b64b200e7519d0ebe0" ON public.rba_belanja USING btree ("kodeRekening");


--
-- Name: IDX_c4a039fff345de37d957a8fb5e; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_c4a039fff345de37d957a8fb5e" ON public.unit_kerja USING btree ("kodeUnit");


--
-- Name: IDX_c4cb153b3c37ad244c187fd3ed; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_c4cb153b3c37ad244c187fd3ed" ON public.journal_entries USING btree (status);


--
-- Name: IDX_cdb869e6ae4670824cf556141f; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_cdb869e6ae4670824cf556141f" ON public.anggaran_kas USING btree ("rbaId");


--
-- Name: IDX_cfd957824aab677b1e2a1c6930; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_cfd957824aab677b1e2a1c6930" ON public.cash_transactions USING btree (status);


--
-- Name: IDX_da29541e66c5d4fce7dc845ba7; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_da29541e66c5d4fce7dc845ba7" ON public.spp USING btree ("unitKerjaId");


--
-- Name: IDX_dd39afe1a06ff637405c9af142; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_dd39afe1a06ff637405c9af142" ON public.journal_entries USING btree ("tanggalJurnal");


--
-- Name: IDX_e252c04b8da142a03be5b5fd25; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_e252c04b8da142a03be5b5fd25" ON public.buku_kas_umum USING btree (tanggal);


--
-- Name: IDX_e419f1e18ddf74571e5ce10632; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_e419f1e18ddf74571e5ce10632" ON public.budgets USING btree ("kodeRekening");


--
-- Name: IDX_e77aeafb7b9f4a52d561583181; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_e77aeafb7b9f4a52d561583181" ON public.fixed_assets USING btree ("kodeAset");


--
-- Name: IDX_ea4207e1535622ec352077a000; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_ea4207e1535622ec352077a000" ON public.payroll USING btree (status);


--
-- Name: IDX_ea4405485da13c98c3487213ca; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_ea4405485da13c98c3487213ca" ON public.surat_tanda_setoran USING btree ("nomorSTS");


--
-- Name: IDX_efce177c234ae15d848fb3b58c; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_efce177c234ae15d848fb3b58c" ON public.dokumen_spp USING btree ("sppId");


--
-- Name: IDX_f41c2a479342bc709a74be5c4d; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_f41c2a479342bc709a74be5c4d" ON public.suppliers USING btree ("kodeSupplier");


--
-- Name: IDX_f454b349bbcb3af42f2d7fc8a7; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_f454b349bbcb3af42f2d7fc8a7" ON public.pegawai USING btree (nip);


--
-- Name: IDX_f7d7bcc72513c16a8b903d6638; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_f7d7bcc72513c16a8b903d6638" ON public.bank_transactions USING btree ("bankAccountId");


--
-- Name: IDX_fb2ff61d6227fd5d9f878245de; Type: INDEX; Schema: public; Owner: sikancil_user
--

CREATE INDEX "IDX_fb2ff61d6227fd5d9f878245de" ON public.cash_transactions USING btree (tanggal);


--
-- Name: spp_rincian FK_13b98a6d96f6d2fd8275b475f2f; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.spp_rincian
    ADD CONSTRAINT "FK_13b98a6d96f6d2fd8275b475f2f" FOREIGN KEY ("sppId") REFERENCES public.spp(id) ON DELETE CASCADE;


--
-- Name: addendum FK_413e0376b4c5a0413a4ad287a67; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.addendum
    ADD CONSTRAINT "FK_413e0376b4c5a0413a4ad287a67" FOREIGN KEY ("kontrakId") REFERENCES public.kontrak_pengadaan(id);


--
-- Name: journal_details FK_4ca245754b4135cbe1810307312; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.journal_details
    ADD CONSTRAINT "FK_4ca245754b4135cbe1810307312" FOREIGN KEY ("journalId") REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- Name: term_pembayaran FK_4dcce4ead319a2a28cff446e14a; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.term_pembayaran
    ADD CONSTRAINT "FK_4dcce4ead319a2a28cff446e14a" FOREIGN KEY ("kontrakId") REFERENCES public.kontrak_pengadaan(id) ON DELETE CASCADE;


--
-- Name: revisi_rba FK_577a4b4746be1a86337345ed944; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.revisi_rba
    ADD CONSTRAINT "FK_577a4b4746be1a86337345ed944" FOREIGN KEY ("rbaId") REFERENCES public.rba(id);


--
-- Name: rba_belanja FK_60cdc75cf050444822bd78992a8; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.rba_belanja
    ADD CONSTRAINT "FK_60cdc75cf050444822bd78992a8" FOREIGN KEY ("rbaId") REFERENCES public.rba(id) ON DELETE CASCADE;


--
-- Name: rba_pendapatan FK_61761c87ba2cbfdc67b0e3d32de; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.rba_pendapatan
    ADD CONSTRAINT "FK_61761c87ba2cbfdc67b0e3d32de" FOREIGN KEY ("rbaId") REFERENCES public.rba(id) ON DELETE CASCADE;


--
-- Name: rba_pembiayaan FK_6bd0e6399af633e93d16eb7a853; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.rba_pembiayaan
    ADD CONSTRAINT "FK_6bd0e6399af633e93d16eb7a853" FOREIGN KEY ("rbaId") REFERENCES public.rba(id) ON DELETE CASCADE;


--
-- Name: depreciation_schedules FK_994d9d5a3d973d5bedbce892fbd; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.depreciation_schedules
    ADD CONSTRAINT "FK_994d9d5a3d973d5bedbce892fbd" FOREIGN KEY ("assetId") REFERENCES public.fixed_assets(id) ON DELETE CASCADE;


--
-- Name: anggaran_kas FK_cdb869e6ae4670824cf556141f4; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.anggaran_kas
    ADD CONSTRAINT "FK_cdb869e6ae4670824cf556141f4" FOREIGN KEY ("rbaId") REFERENCES public.rba(id) ON DELETE CASCADE;


--
-- Name: dokumen_spp FK_efce177c234ae15d848fb3b58c4; Type: FK CONSTRAINT; Schema: public; Owner: sikancil_user
--

ALTER TABLE ONLY public.dokumen_spp
    ADD CONSTRAINT "FK_efce177c234ae15d848fb3b58c4" FOREIGN KEY ("sppId") REFERENCES public.spp(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO sikancil_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO sikancil_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO sikancil_user;


--
-- PostgreSQL database dump complete
--

\unrestrict kUtlCLWSQqj31xX6Bv5KZ7GUPLmXP4qAFKcmxAfDpFWfsiH4rWfHYb6OZbNOT6v

