export function formatMessageTime (timestamp: string) {
    const messageDate = new Date(timestamp);
    const now = new Date();

    const isToday = 
        messageDate.getDate() === now.getDate() &&
        messageDate.getMonth() === now.getMonth() && 
        messageDate.getFullYear() === now.getFullYear();

    if(isToday) {
        return messageDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    return messageDate.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};



