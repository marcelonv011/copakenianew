import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth, db } from '@/firebase/config';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, Trophy } from 'lucide-react';
import GoogleIcon from '@/components/GoogleIcon';
import { useAuth } from '@/lib/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createUserDocument = async (firebaseUser) => {
    await setDoc(
      doc(db, 'users', firebaseUser.uid),
      {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        full_name: firebaseUser.displayName || firebaseUser.email,
        photoURL: firebaseUser.photoURL || '',
        updated_date: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      await createUserDocument(result.user);
      await checkUserAuth();

      navigate('/');
    } catch (err) {
      console.error(err);

      if (err.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos');
      } else if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con ese email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta');
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await createUserDocument(result.user);
      await checkUserAuth();

      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Error al iniciar sesión con Google');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-background px-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-10'>
          <Link to='/' className='inline-flex items-center gap-2 mb-4'>
            <div className='w-12 h-12 rounded-xl bg-primary flex items-center justify-center'>
              <Trophy className='w-6 h-6 text-primary-foreground' />
            </div>
          </Link>

          <h1 className='font-display text-3xl font-bold tracking-tight text-foreground'>
            Iniciar Sesión
          </h1>

          <p className='text-muted-foreground mt-2'>
            Ingresá a tu cuenta de Copa Kenia
          </p>
        </div>

        <div className='bg-card rounded-2xl shadow-sm border border-border p-8'>
          <Button
            variant='outline'
            className='w-full h-12 text-sm font-medium mb-6'
            onClick={handleGoogle}
          >
            <GoogleIcon className='w-5 h-5 mr-2' />
            Continuar con Google
          </Button>

          <div className='relative mb-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-card px-3 text-muted-foreground'>o</span>
            </div>
          </div>

          {error && (
            <div className='mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  autoComplete='email'
                  autoFocus
                  placeholder='tu@email.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='pl-10 h-12'
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Contraseña</Label>
                <Link
                  to='/forgot-password'
                  className='text-xs text-primary hover:underline'
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  id='password'
                  type='password'
                  autoComplete='current-password'
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='pl-10 h-12'
                  required
                />
              </div>
            </div>

            <Button
              type='submit'
              className='w-full h-12 font-medium bg-primary'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>
        </div>

        <p className='text-center text-sm text-muted-foreground mt-6'>
          ¿No tenés cuenta?{' '}
          <Link
            to='/register'
            className='text-primary font-medium hover:underline'
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
