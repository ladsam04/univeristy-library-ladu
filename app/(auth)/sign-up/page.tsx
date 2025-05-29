"use client"
import AuthForm from '@/components/AuthForm'
import { signUp } from '@/lib/actions/auth'
import { signUpSchema } from '@/lib/validation'
import React from 'react'

const page = () => (
    <AuthForm
        type="SIGN_UP"
        schema={signUpSchema}
        defaultValues={{ fullName: '', email: '', universityId: 0, universityCard: '', password: '' }}
        onSubmit={signUp}
    />
)

export default page