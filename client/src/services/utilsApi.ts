export const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Request failed with status ${response.status}`
      }));
      const error = new Error(errorData.message || "An unknown error occurred");
      (error as any).status = response.status;
      (error as any).response = { data: errorData };
      throw error;
    }
    if(response.status==204){
      return;
    }

    return response.json();
  };