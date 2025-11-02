import { useEffect, useState, useRef } from 'react'
import { chatAPI } from '../../services/api'
import { useSocket } from '../../contexts/SocketContext'
import { useUser } from '../../contexts/UserContext'
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface ChatTabProps {
  caseData: any
}

export default function ChatTab({ caseData }: ChatTabProps) {
  const { user } = useUser()
  const { socket } = useSocket()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()

    // Listen for real-time messages
    if (socket) {
      socket.on('chat:message', (message: any) => {
        setMessages((prev) => [...prev, message])
      })
    }
  }, [socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(caseData.id)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      await chatAPI.sendMessage({
        donorCaseId: caseData.id,
        content: newMessage,
      })
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('donorCaseId', caseData.id)

    try {
      await chatAPI.uploadFile(formData)
      toast.success('File uploaded')
    } catch (error) {
      toast.error('Failed to upload file')
    }
  }

  return (
    <div className="card flex flex-col h-[calc(100vh-300px)]">
      <h2 className="text-xl font-semibold mb-4">Case Chat</h2>

      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.authorId === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.authorId === user?.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {message.messageType === 'AUTO_SUMMARY' && (
                <p className="text-xs opacity-75 mb-1">System</p>
              )}
              {message.messageType === 'USER' && message.authorId !== user?.id && (
                <p className="text-xs opacity-75 mb-1">
                  {message.author.firstName} {message.author.lastName}
                </p>
              )}
              <p>{message.content}</p>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((att: any, i: number) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm underline"
                    >
                      {att.name}
                    </a>
                  ))}
                </div>
              )}
              <p className="text-xs opacity-75 mt-1">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center space-x-2">
        <label className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <PaperClipIcon className="w-5 h-5" />
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
        <input
          type="text"
          className="input flex-1"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending || !newMessage.trim()}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
