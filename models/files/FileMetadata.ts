export class FileData
{
    name: string = '';
    id: string = '';
    updated_at: string = '';
    created_at: string = '';
    last_accessed_at: string = '';
    metadata: FileMetaData = new FileMetaData();
}

export class FileMetaData
{
    size: number = 0;
    mimetype: string = '';
    lastModified: string = '';
    contentLength: number = 0;

    // useless stuff.
    eTag: string = '';
    cacheControl: string = '';
    httpstatusCode: number = 0;
    updated_at: string = '';
    created_at: string = '';
    id: string = '';
}