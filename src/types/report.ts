export interface Report {
    filename: string,
    size: string, // Expressed in MB // TODO change to number
    message: string,
    status: "Not selected" | "Processing" |"Uploaded" | "Failed"
}
