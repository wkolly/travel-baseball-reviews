import React from 'react';
import { ChatRoom } from '@travel-baseball/shared';
import { MessageCircle, Globe, MapPin } from 'lucide-react';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoom: string | null;
  onSelectRoom: (roomId: string) => void;
  isLoading?: boolean;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  isLoading,
}) => {
  const globalRooms = rooms.filter(room => room.type === 'GLOBAL');
  const stateRooms = rooms.filter(room => room.type === 'STATE');

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const RoomButton: React.FC<{ room: ChatRoom; icon: React.ReactNode }> = ({ room, icon }) => (
    <button
      onClick={() => onSelectRoom(room.id)}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center ${
        selectedRoom === room.id
          ? 'bg-primary-100 text-primary-800 border border-primary-200'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <span className="mr-3 flex-shrink-0">{icon}</span>
      <span className="text-sm font-medium truncate">{room.name}</span>
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Global Rooms */}
      {globalRooms.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            General
          </h3>
          <div className="space-y-1">
            {globalRooms.map(room => (
              <RoomButton
                key={room.id}
                room={room}
                icon={<Globe className="h-4 w-4" />}
              />
            ))}
          </div>
        </div>
      )}

      {/* State Rooms */}
      {stateRooms.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            State Discussions
          </h3>
          <div className="space-y-1">
            {stateRooms.map(room => (
              <RoomButton
                key={room.id}
                room={room}
                icon={<MapPin className="h-4 w-4" />}
              />
            ))}
          </div>
        </div>
      )}

      {rooms.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 py-8">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No chat rooms available</p>
        </div>
      )}
    </div>
  );
};

export default ChatRoomList;