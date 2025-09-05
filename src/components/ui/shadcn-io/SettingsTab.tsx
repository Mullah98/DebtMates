import { useEffect, useState, type ChangeEvent } from 'react';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '../../shadcn-ui/sheet';
import { Settings } from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { supabase } from '../../../../supabaseClient';
import { toast } from 'sonner';
import DefaultAvatar from '../../../assets/default_avatar.png'

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface SettingsTabProps {
    userId: string | undefined
    profileIcon: string | undefined
    onAvatarUpdated?: () => void
}

function SettingsTab( { userId, profileIcon, onAvatarUpdated }: SettingsTabProps) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [userProfileIcon, setUserProfileIcon] = useState<string | undefined>(profileIcon);
    
    useEffect(() => {
        setUserProfileIcon(profileIcon)
    }, [profileIcon])

    // Function handler when user selects a new file
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    // Uploading the selected file to Supabase storage and update the user's profile
    const handleFileUpload = async () => {
        if (!file) return;

        setStatus("uploading");

        // Generate a unique file name to avoid conflicts
        const fileName = `${uuidv4()}-${file.name}`;

        // Upload file to the 'avatars' bucket under userId folder
        const { error } = await supabase.storage.from("avatars").upload(`${userId}/${fileName}`, file);

        if (error) {
            console.error(error);
            setStatus("error");
            toast.error("upload failed");
            return;
        }

        const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(`${userId}/${fileName}`);        
        
        const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl.publicUrl }).eq("id", userId);

        if (updateError) {
            console.error(updateError);
            setStatus("error");
            toast.error("failed to save avatar");
            return;
        }
        
        setUserProfileIcon(publicUrl.publicUrl);
        setStatus("success");        
        toast.success("avatar updated!");
        setFile(null); // Clear the file and status once the new profile avatar is updated
        setTimeout(() => setStatus('idle'), 3000);
        onAvatarUpdated?.(); // Notify Dashboard component the avatar was updated
    }

    
  return (
    <Sheet>
        <SheetTrigger><Settings size={20}/></SheetTrigger>
        <SheetContent className='pt-12 flex flex-col items-center'>
            <SheetHeader className='mt-12 text-center'>
                <SheetTitle>Profile settings</SheetTitle>
                <SheetDescription>Upload your profile image.</SheetDescription>
            </SheetHeader>

        <div className='flex flex-col items-center gap-4'>
            {status === "uploading" ? (
            <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center rounded-full border border-gray-300">
                <span className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></span>
            </div>
            ) : (
            <img
                src={userProfileIcon || DefaultAvatar}
                alt="profile image"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-gray-300 object-cover"
            />
            )}

            <div className="flex flex-col items-center gap-3 w-full px-4">
                <label
                    htmlFor="avatar-upload"
                    className="text-sm cursor-pointer px-4 py-2 bg-orange-400 text-white rounded-md shadow hover:bg-orange-500"
                >
                    Choose File
                </label>
                <input
                    id="avatar-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                {file && ( 
                    <p className="text-sm text-gray-600 max-w-[300px] truncate">
                        Selected: {file.name}
                    </p>
                )}

                {file && ( 
                    <button onClick={handleFileUpload} disabled={status === 'uploading'}>
                        {status === 'uploading' ? "Uploading.." : "Upload image"}
                    </button>
                )}
             </div>

            {/* <button className='px-4 py-2 bg-blue-500 text-white rounded'>Save button</button> */}
        </div>
        </SheetContent>
    </Sheet>
  )
}

export default SettingsTab
