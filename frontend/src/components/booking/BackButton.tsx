import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton({facultyIdentifier}: { facultyIdentifier: string }) {
    return (
        <Link to="/$facultyIdentifier" params={{ facultyIdentifier }}>
            <Button
                variant="ghost"
                size="icon"
                className="flex cursor-pointer items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
    );
}
