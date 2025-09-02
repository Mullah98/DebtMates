import { useState, type ChangeEvent } from 'react';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '../../shadcn-ui/sheet';
import { Settings } from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { supabase } from '../../../../supabaseClient';
import { toast } from 'sonner';

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface SettingsTabProps {
    userId: string
}


function SettingsTab( { userId }: SettingsTabProps) {
    const img = 'https://www.shutterstock.com/image-photo/headshot-portrait-happy-millennial-man-600nw-1548802709.jpg'
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<UploadStatus>('idle');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    const handleFileUpload = async () => {
        if (!file) return;

        setStatus("uploading");

        const fileName = `${uuidv4()}-${file.name}`;

        const { data, error } = await supabase.storage.from("avatars").upload(`${userId}/${fileName}`, file);


        if (error) {
            console.error(error);
            setStatus("error");
            toast.error("upload failed");
            return;
        }

        const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(fileName);
        
        const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl.publicUrl }).eq("id", userId);

        if (updateError) {
            console.error(updateError);
            setStatus("error");
            toast.error("failed to save avatar");
            return;
        }

        setStatus("success");
        toast.success("avatar updated!")
    }

  return (
    <Sheet>
        <SheetTrigger><Settings size={20}/></SheetTrigger>
        <SheetContent>
            <SheetHeader className='mt-8'>
                <SheetTitle>Profile settings</SheetTitle>
                <SheetDescription>Upload your profile image.</SheetDescription>
            </SheetHeader>

        <div className='mt-6 flex flex-col items-center gap-4'>
            <img src={img} alt='profile image' className='w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-gray-300 object-cover'/>

            <input type='file' onChange={handleFileChange} accept='image/*' className='border border-gray-400 file-input file-input-bordered' />

            {file && (
                <div className='mb-4 text-sm'>
                    <p>File name: {file.name}</p>
                    <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                    <p>Type: {file.type}</p>
                </div>
            )}
            {file && ( 
                <button onClick={handleFileUpload}>
                    {status === 'uploading' ? "Uploading.." : "Upload image"}
                </button>
             )}
            {/* <button className='px-4 py-2 bg-blue-500 text-white rounded'>Save button</button> */}
        </div>
        </SheetContent>
    </Sheet>
  )
}

export default SettingsTab
