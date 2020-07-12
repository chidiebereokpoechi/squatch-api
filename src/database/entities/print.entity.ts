import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { getContentSlices, renderSlices } from '../../util/misc'
import { Base } from './base.entity'
import { PrintLiking } from './print-liking.entity'
import { User } from './user.entity'

@Entity('prints')
export class Print extends Base {
  @Column()
  public content!: string

  @Column({ default: '' })
  public rendered!: string

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

  @Column({ generatedType: 'VIRTUAL', select: false, default: false })
  public userHasLiked?: boolean

  @BeforeInsert()
  public renderContent() {
    this.rendered = renderSlices(getContentSlices(this.content))
  }
}
