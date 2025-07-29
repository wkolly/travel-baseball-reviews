import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Globe, Wifi, WifiOff } from 'lucide-react';
import { useChatRooms, useChat } from '@/hooks/useChat';
import ChatRoomList from '@/components/ChatRoomList';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import LoadingSpinner from '@/components/LoadingSpinner';

const ChatPage: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const { data: roomsData, isLoading: roomsLoading, error: roomsError } = useChatRooms();
  
  const {
    messages,
    isLoading: messagesLoading,
    isConnected,
    typingUsers,
    sendMessage,
    onTypingStart,
    onTypingStop,
    isSending,
  } = useChat(selectedRoomId || '');

  const rooms = roomsData?.data || [];
  const selectedRoom = rooms.find(room => room.id === selectedRoomId);

  // Auto-select first room when rooms load
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      // Prefer global room first, or fallback to first room
      const globalRoom = rooms.find(room => room.type === 'GLOBAL');
      setSelectedRoomId(globalRoom?.id || rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Community Chat
            </h1>
            <p className="text-lg text-gray-600">
              Connect with other families and discuss travel baseball teams.
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </div>

      {roomsError as any && (
        <div className="card mb-8">
          <div className="card-body">
            <div className="text-center py-8">
              <div className="text-red-400 mb-4">
                <MessageCircle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unable to load chat rooms
              </h3>
              <p className="text-gray-600 mb-4">
                There was an error loading the chat rooms. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}

      {!roomsError && (
        <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
          {/* Room List Sidebar */}
          <div className="lg:col-span-1">
            <div className="card h-full">
              <div className="card-header">
                <h2 className="text-lg font-semibold flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Chat Rooms
                </h2>
              </div>
              <div className="card-body">
                <ChatRoomList
                  rooms={rooms}
                  selectedRoom={selectedRoomId}
                  onSelectRoom={setSelectedRoomId}
                  isLoading={roomsLoading}
                />
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="card h-full flex flex-col">
              {selectedRoom ? (
                <>
                  {/* Chat Header */}
                  <div className="card-header flex items-center justify-between">
                    <div className="flex items-center">
                      {selectedRoom.type === 'GLOBAL' ? (
                        <Globe className="h-5 w-5 mr-2 text-blue-500" />
                      ) : (
                        <Users className="h-5 w-5 mr-2 text-green-500" />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold">{selectedRoom.name}</h2>
                        {selectedRoom.type === 'STATE' && selectedRoom.state && (
                          <p className="text-sm text-gray-500">{selectedRoom.state} teams discussion</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isConnected ? 'bg-green-400' : 'bg-red-400'
                        }`}
                      />
                      <span>{isConnected ? 'Live' : 'Offline'}</span>
                    </div>
                  </div>

                  {/* Messages */}
                  <ChatMessages
                    messages={messages}
                    isLoading={messagesLoading}
                    typingUsers={typingUsers}
                  />

                  {/* Message Input */}
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    onTypingStart={onTypingStart}
                    onTypingStop={onTypingStop}
                    disabled={!isConnected}
                    isLoading={isSending}
                    placeholder={
                      isConnected
                        ? `Message ${selectedRoom.name}...`
                        : 'Connecting to chat...'
                    }
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  {roomsLoading ? (
                    <LoadingSpinner size="lg" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Select a chat room</h3>
                      <p className="text-sm">Choose a room from the sidebar to start chatting</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;