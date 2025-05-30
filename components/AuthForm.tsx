"use client"
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { DefaultValues, FieldValues, Path, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import { ZodType } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constants";
import { useRouter } from "next/navigation";
import { on } from 'events';
import { toast } from '@/hooks/use-toast';
import FileUpload from './FileUpload';

interface Props<T extends FieldValues> {
  schema: ZodType<T>
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  type: 'SIGN_IN' | 'SIGN_UP';
}
const AuthForm = <T extends FieldValues> ({ type, schema, defaultValues, onSubmit }: Props<T>) => {
  
    const router = useRouter();
  const isSignIn = type === 'SIGN_IN';
  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
    });
  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = await onSubmit(data);
    if (result.success) {
      toast({
        title: "Success",
        description: isSignIn ? "You have successfully signed in." : "Your account has been created successfully.",
      });
      router.push('/');
    } else {
      toast({
        title: `Error ${isSignIn ? "Signing In" : "Creating Account"}`,
        description: result.error || "An unexpected error occurred.",
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='flex flex-col gap-4'>
        <h1 className='text-2xl font-semibold text-white'>
            {isSignIn ? "Welcome back to BookWise" : "Create your BookWise library account"}
        </h1>
        <p className='text-light-100'>
            {isSignIn
                ? "Access the vast collection of resources, and stay updated"
                : "Please complete all fields and upload a valid university ID to gain access to the library"
            } 
        </p>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6 w-full'>
                {Object.keys(defaultValues).map((field) => (
                    <FormField key={field} name={field as Path<T>} control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className='capitalize'>{FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}</FormLabel>
                            <FormControl>
                                {field.name === 'universityCard' ? 
                                    ( <FileUpload type='image' accept='image/*' placeholder='Upload your university ID' folder='university-ids' variant='dark' onFileChange={field.onChange} /> ) 
                                    : 
                                    (
                                    <input 
                                        required   
                                        type={
                                            FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]}
                                            {...field}
                                            className='form-input' 
                                            />
                                    )
                                }  
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} 
                    />
                ))}
                <Button type='submit' className='form-btn'>
                    {isSignIn ? "Sign In" : "Sign Up"}
                </Button>
            </form>
        </Form>
        <p className='text-center text-base font-medium'>
            {isSignIn ? "New to BookWise? " : "Already have an account? "}
            <Link href={isSignIn ? '/sign-up' : '/sign-in'} className='text-primary font-bold'>
                {isSignIn ? "Create an account" : "Sign In"}
            </Link>
        </p>
    </div>
  )
};

export default AuthForm