import { Column, Entity, OneToOne, Unique } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'

@Unique('login', ['email'])
@Entity('logins')
export class Login extends Base {
  @Column()
  public email!: string

  @Column()
  public password!: string

  @OneToOne(
    () => User,
    user => user.login
  )
  public user!: User
}
