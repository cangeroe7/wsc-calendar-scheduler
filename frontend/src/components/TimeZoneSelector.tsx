import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from "./ui/select";
import { Globe } from "lucide-react";

export const TimezoneSelector = () => (
    <Select defaultValue="eastern">
        <SelectTrigger className="cursor-pointer w-full border-black/30 bg-white">
            <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <SelectValue placeholder="Select timezone" />
            </div>
        </SelectTrigger>
        <SelectContent className="shadow-lg shadow-black/20">
            <SelectItem value="eastern" className="cursor-pointer">
                Eastern time - US & Canada
            </SelectItem>
            <SelectItem value="central" className="cursor-pointer">
                Central time - US & Canada
            </SelectItem>
            <SelectItem value="mountain" className="cursor-pointer">
                Mountain time - US & Canada
            </SelectItem>
            <SelectItem value="pacific" className="cursor-pointer">
                Pacific time - US & Canada
            </SelectItem>
        </SelectContent>
    </Select>
);
