import { find, matches, remove } from 'lodash'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { Base } from './base.entity'
import { User } from './user.entity'

@Entity('prints')
export class Print extends Base {
  @Column()
  public content!: string

  @ManyToOne(
    () => User,
    user => user.prints
  )
  @JoinColumn()
  public creator!: User

  @ManyToMany(
    () => User,
    user => user.liked,
    { cascade: ['remove'] }
  )
  @JoinTable({ name: 'print-likers' })
  public likers!: User[]

  public userIsLiker(user: User): User | undefined {
    return find(this.likers, { id: user.id })
  }

  public addLiker(user: User): Print {
    if (!this.userIsLiker(user)) {
      this.likers.push(user)
    }

    return this
  }

  public removeLiker(user: User): Print {
    remove(this.likers, matches({ id: user.id }))
    return this
  }
}
