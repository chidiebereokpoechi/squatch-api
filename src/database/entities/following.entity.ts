import { Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'

@Entity('followings')
export class Following extends Base {
  @ManyToOne(() => User)
  @JoinColumn()
  public follower!: User

  @ManyToOne(() => User)
  @JoinColumn()
  public following!: User
}
