import { Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Base } from './base.entity'
import { Print } from './print.entity'
import { User } from './user.entity'

@Entity('print_likings')
export class PrintLiking extends Base {
  @ManyToOne(() => Print)
  @JoinColumn()
  public print!: Print

  @ManyToOne(() => User)
  @JoinColumn()
  public liker!: User
}
