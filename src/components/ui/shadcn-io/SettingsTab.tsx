import { useEffect, useState, type ChangeEvent } from 'react';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '../../shadcn-ui/sheet';
import { Settings } from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { supabase } from '../../../../supabaseClient';
import { toast } from 'sonner';
import DefaultAvatar from '../../../assets/default_avatar.png'
import { Tabs, TabsTrigger, TabsList } from '@/components/shadcn-ui/tabs';

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface SettingsTabProps {
    userId: string | undefined
    profileIcon: string | undefined
    onAvatarUpdated?: () => void
    currency: string | undefined
    onCurrencyChange: (value: string) => void
}

function SettingsTab( { userId, profileIcon, onAvatarUpdated, onCurrencyChange }: SettingsTabProps) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [userProfileIcon, setUserProfileIcon] = useState<string | undefined>(profileIcon);
    const [currency, setCurrency] = useState('GBP')
    
    useEffect(() => {
        setUserProfileIcon(profileIcon)
    }, [profileIcon])

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

    const updateCurrency = (value: string) => {
        setCurrency(value);
        onCurrencyChange(value);
    }
    
  return (
    <Sheet>
        <SheetTrigger>
            <Settings size={20}/>
        </SheetTrigger>
        <SheetContent className='pt-6 flex flex-col items-center'>
            
            <div className='flex flex-col items-center gap-6'>
                <SheetHeader className='mt-2 text-center'>
                <SheetTitle className='mt-2'>Profile settings</SheetTitle>
                <SheetDescription>Upload your profile image.</SheetDescription>
                {status === "uploading" ? (
                <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center rounded-full border border-gray-300">
                    <span className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></span>
                </div>
                ) : (
                <img
                    src={userProfileIcon || DefaultAvatar}
                    alt="profile image"
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-gray-300 object-cover mt-4 mx-4"
                />
                )}

                <div className="flex flex-col items-center w-full mt-4">
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
                </SheetHeader>
            </div>
            
            {/* <div className='flex flex-col items-center gap-4 border-t border-gray-200'>
                <SheetHeader className='mt-12 text-center'>
                    <SheetTitle>Account settings</SheetTitle>
                    <SheetDescription>Change your email or password</SheetDescription>
                </SheetHeader>
                <input type='email' placeholder='new email' className='input-style' />
                <input type='password' placeholder='new password' className='input-style' />
                <button className='btn-style mt-2'>Save changes</button>
            </div> */}

            <div className='flex flex-col items-center gap-4 border-t border-gray-200 pt-4'>
                <SheetHeader className='mt-12  text-center'>
                    <SheetTitle>Preference</SheetTitle>
                    <SheetDescription>Update your preference settings</SheetDescription>
                </SheetHeader>
                <Tabs value={currency} onValueChange={onCurrencyChange}>
                    <TabsList className='flex space-x-2 mb-2'>
                        <TabsTrigger value='$' className='px-4 py-2 rounded border border-gray-200 data-[state=active]:border-orange-500'>$</TabsTrigger>
                        <TabsTrigger value='£' className='px-4 py-2 rounded border border-gray-200 data-[state=active]:border-orange-500'>£</TabsTrigger>
                        <TabsTrigger value='€' className='px-4 py-2 rounded border border-gray-200 data-[state=active]:border-orange-500'>€</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        


        </SheetContent>
            {/* <button className='px-4 py-2 bg-blue-500 text-white rounded'>Save button</button> */}
    </Sheet>
  )
}

export default SettingsTab
