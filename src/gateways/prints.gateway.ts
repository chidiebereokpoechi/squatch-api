import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets'
import { User } from '../database/entities'

@WebSocketGateway({ namespace: 'api/prints' })
export class PrintsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: SocketIO.Server
  private connectedUsers: { [token: string]: number } = {}

  public async handleConnection(socket: SocketIO.Socket) {
    const { user }: { user: User } = socket.request

    if (!user) {
      throw new WsException('Unauthorized')
    }

    this.connectedUsers[socket.id] = user.id
  }

  public async handleDisconnect(socket: SocketIO.Socket) {
    delete this.connectedUsers[socket.id]
  }

  // @SubscribeMessage('create')
  // public async onMessage(socket: SocketIO.Socket, payload: { id: number }) {
  // }
}
