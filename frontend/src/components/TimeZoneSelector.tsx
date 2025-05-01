import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from "./ui/select";
import { Globe } from "lucide-react";

export const TimezoneSelector = () => (
    <Select defaultValue="eastern">
        <SelectTrigger className="shadow-lg shadow-black/20 w-full border-black bg-white">
            <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <SelectValue placeholder="Select timezone" />
            </div>
        </SelectTrigger>
        <SelectContent className="shadow-lg shadow-black/20">
            <SelectItem value="eastern">
                Eastern time - US & Canada
            </SelectItem>
            <SelectItem value="central">
                Central time - US & Canada
            </SelectItem>
            <SelectItem value="mountain">
                Mountain time - US & Canada
            </SelectItem>
            <SelectItem value="pacific">
                Pacific time - US & Canada
            </SelectItem>
        </SelectContent>
    </Select>
);
