"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
    const query = `SELECT * FROM users WHERE name = ? AND password = ?`;
    const email = (e.currentTarget.elements[0] as HTMLInputElement).value;
    const password = (e.currentTarget.elements[1] as HTMLInputElement).value;
    setLoading(true)
    window.electronAPI.dbQuery(query, [
     email,
      password
    ])
    .then((result) => {
      console.log("Result:", result);
      if (result.length > 0) {
        toast.success("تم تسجيل الدخول بنجاح");
        console.log("User logged in successfully", result[0]);
        router.push('/dashboard')
      } else {
        alert("Invalid username or password");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      setLoading(false)
    })
   

    // router.push('/dashboard') // Redirect to cash payment form
  };

  return (
    <div
      className={cn(
        "flex w-[22rem] flex-col gap-6 font-tajwal-medium",
        className
      )}
      dir="rtl"
      {...props}
    >
      <Card className="shadow-none rounded-2xl border-gray-200/80">
        <CardHeader className="text-center items-center space-y-6">
          <Image
            src={"/state_of_qatar.svg"}
            alt="State of Qatar"
            width={1000}
            height={1000}
            className="h-24 w-24 object-contain drop-shadow-sm"
          />
          <CardTitle className="text-2xl drop-shadow-sm text-primary">
            مرحباً بعودتك
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <Label htmlFor="email" className="drop-shadow-sm text-base">
                    اسم المستخدم
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder=""
                    required
                    className="border-gray-200/80"
                  />
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center">
                    <Label
                      htmlFor="password"
                      className="drop-shadow-sm text-base"
                    >
                      كلمة المرور
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="border-gray-200/80"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="scale-110 drop-shadow-sm text-gray-300" />
                      ) : (
                        <Eye className="scale-110 drop-shadow-sm text-gray-300" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full shadow-none font-tajwal-medium text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {
                    loading ? 
                    <span className="drop-shadow-sm">جاري تسجيل الدخول...</span>
                    : <span className="drop-shadow-sm">تسجيل الدخول</span> 
                  }
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance drop-shadow-sm text-center text-sm text-gray-400 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        هل تواجه مشكلة؟ تواصل مع <a href="#">المسؤول</a> أو{" "}
        <a href="#">المدير</a>
      </div>
    </div>
  );
}

export default LoginForm;
