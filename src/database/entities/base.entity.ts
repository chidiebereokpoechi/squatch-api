import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export abstract class Base {
  @PrimaryGeneratedColumn()
  public id!: number

  @CreateDateColumn({ select: false })
  public createdAt!: Date

  @UpdateDateColumn({ select: false })
  public updatedAt!: Date
}
