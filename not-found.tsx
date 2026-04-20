import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#ebebeb]" dir="rtl">
      <Card className="w-full max-w-md mx-4 border-[#ebebeb]">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-[#B42318]" />
            <h1 className="text-2xl font-bold text-[#1F2937]">٤٠٤ الصفحة غير موجودة</h1>
          </div>

          <p className="mt-4 text-sm text-[#1F2937]/70">
            الصفحة التي تبحث عنها غير متوفرة. يرجى التأكد من الرابط أو العودة للصفحة الرئيسية.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
