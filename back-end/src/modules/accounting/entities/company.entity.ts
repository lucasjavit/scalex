import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { CompanyRegistrationRequest } from './company-registration-request.entity';

/**
 * Company Status Enum
 */
export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * Company Type Enum
 */
export enum CompanyType {
  MEI = 'MEI',
  ME = 'ME',
  EIRELI = 'EIRELI',
  LTDA = 'LTDA',
  SA = 'SA',
}

/**
 * Tax Regime Enum
 */
export enum TaxRegime {
  SIMPLES_NACIONAL = 'Simples Nacional',
  LUCRO_PRESUMIDO = 'Lucro Presumido',
  LUCRO_REAL = 'Lucro Real',
}

/**
 * Company Entity
 *
 * Represents a registered company that has been successfully created
 * through the accounting module after CNPJ opening.
 *
 * Features:
 * - Complete company information (legal name, CNPJ, address, etc.)
 * - Links to user (owner), accountant (manager), and original request
 * - Supports different company types and tax regimes
 * - JSONB address for flexible storage
 * - Status tracking (active, inactive, suspended)
 *
 * Relationships:
 * - ManyToOne with User (owner)
 * - ManyToOne with User (accountant)
 * - ManyToOne with CompanyRegistrationRequest (optional)
 */
@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'accountant_id', type: 'uuid' })
  accountantId: string;

  @Column({ name: 'request_id', type: 'uuid', nullable: true })
  requestId: string | null;

  @Column({ name: 'legal_name', type: 'varchar', length: 255 })
  legalName: string;

  @Column({ name: 'trade_name', type: 'varchar', length: 255, nullable: true })
  tradeName: string | null;

  @Column({ type: 'varchar', length: 18, unique: true })
  cnpj: string;

  @Column({ name: 'company_type', type: 'varchar', length: 50 })
  companyType: CompanyType;

  @Column({ name: 'main_activity', type: 'varchar', length: 500 })
  mainActivity: string;

  @Column({ name: 'tax_regime', type: 'varchar', length: 50 })
  taxRegime: TaxRegime;

  @Column({ name: 'opening_date', type: 'date' })
  openingDate: Date;

  @Column({ name: 'estimated_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedRevenue: number;

  @Column({ type: 'jsonb' })
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  @Column({ name: 'state_registration', type: 'varchar', length: 50, nullable: true })
  stateRegistration: string | null;

  @Column({ name: 'municipal_registration', type: 'varchar', length: 50, nullable: true })
  municipalRegistration: string | null;

  @Column({ type: 'varchar', length: 20, default: CompanyStatus.ACTIVE })
  status: CompanyStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'accountant_id' })
  accountant: User;

  @ManyToOne(() => CompanyRegistrationRequest, { nullable: true })
  @JoinColumn({ name: 'request_id' })
  request: CompanyRegistrationRequest | null;

  /**
   * Format CNPJ with mask
   * @returns CNPJ formatted as XX.XXX.XXX/XXXX-XX
   */
  getFormattedCnpj(): string {
    if (!this.cnpj) return '';
    return this.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  /**
   * Check if company is active
   * @returns true if status is ACTIVE
   */
  isActive(): boolean {
    return this.status === CompanyStatus.ACTIVE;
  }

  /**
   * Get full address as string
   * @returns Full formatted address
   */
  getFullAddress(): string {
    const { street, number, complement, neighborhood, city, state, zipCode } = this.address;
    const complementStr = complement ? `, ${complement}` : '';
    return `${street}, ${number}${complementStr} - ${neighborhood}, ${city}/${state} - CEP: ${zipCode}`;
  }
}
