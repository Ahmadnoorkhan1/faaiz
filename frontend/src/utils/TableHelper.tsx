export const getClientInitials = (name: string) => {
    if (!name || name === "N/A") return "?";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0);
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
  };


export const getStatusText = (status: any) => {
    const mappedStatus = status;
    return mappedStatus.replace(/_/g, " ");
  };