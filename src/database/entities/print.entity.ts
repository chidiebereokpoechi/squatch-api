import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { Base } from './base.entity'
import { PrintLiking } from './print-liking.entity'
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

  @OneToMany(
    () => PrintLiking,
    printLiking => printLiking.print
  )
  public likings!: PrintLiking[]

  @Column({ default: 0 })
  public likeCount!: number
}
