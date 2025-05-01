import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton({facultyIdentifier}: { facultyIdentifier: string }) {
    return (
        <Link to="/$facultyIdentifier" params={{ facultyIdentifier }}>
            <Button
                variant="ghost"
                size="default"
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md px-2 py-1"
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
    );
}
