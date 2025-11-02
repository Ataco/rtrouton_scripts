import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth0 } from '@auth0/auth0-react'
import toast from 'react-hot-toast'

interface SocketContextType {
  socket: Socket | null
  joinCase: (caseId: string) => void
  leaveCase: (caseId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    const initSocket = async () => {
      const token = await getAccessTokenSilently()

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      // Real-time event handlers
      newSocket.on('chat:message', (message: any) => {
        // Chat messages are handled by the chat component
      })

      newSocket.on('transport:eta-update', (data: any) => {
        toast.success(`Transport ETA updated: ${new Date(data.eta).toLocaleTimeString()}`)
      })

      newSocket.on('preservation:time-warning', (data: any) => {
        if (data.warning) {
          toast.error(`⚠️ Preservation time warning: ${data.coldRemaining}min cold / ${data.warmRemaining}min warm remaining`)
        }
      })

      newSocket.on('organ-match:created', () => {
        toast.success('New organ match created')
      })

      newSocket.on('organ-match:updated', () => {
        toast.info('Organ match updated')
      })

      newSocket.on('report:submitted', (data: any) => {
        toast.success(`${data.formType} report submitted`)
      })

      setSocket(newSocket)
    }

    initSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [isAuthenticated])

  const joinCase = (caseId: string) => {
    if (socket) {
      socket.emit('join-case', caseId)
    }
  }

  const leaveCase = (caseId: string) => {
    if (socket) {
      socket.emit('leave-case', caseId)
    }
  }

  return (
    <SocketContext.Provider value={{ socket, joinCase, leaveCase }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
