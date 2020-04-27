import {
  Column,
  Entity,
  getRepository,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm'
import { Base } from './base.entity'
import { Following } from './following.entity'
import { Login } from './login.entity'
import { Print } from './print.entity'

@Unique('user', ['username'])
@Entity('users')
export class User extends Base {
  @Column()
  public name!: string

  @Column()
  public username!: string

  @Column({ default: '' })
  public bio!: string

  @OneToOne(
    () => Login,
    login => login.user
  )
  @JoinColumn()
  public login!: Login

  @OneToMany(
    () => Print,
    print => print.creator
  )
  public prints!: Print[]

  @ManyToMany(
    () => Print,
    print => print.likers
  )
  public liked!: Print[]

  @OneToMany(
    () => Following,
    following => following.following
  )
  public followings!: Following[]

  @Column({ default: 0 })
  public followersCount!: number

  @Column({ default: 0 })
  public followingCount!: number
}
