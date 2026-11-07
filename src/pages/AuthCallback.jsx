import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemedButton } from '../components/ui/ThemedButton';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { theme } = useTheme();
    const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let isMounted = true;

        const processAuth = async () => {
            try {
                // Check if URL has error parameters (e.g. user canceled Google login)
                const urlParams = new URLSearchParams(window.location.search);
                const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
                
                const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
                const errorCode = urlParams.get('error') || hashParams.get('error');

                if (errorCode || errorDescription) {
                    if (isMounted) {
                        setStatus('error');
                        setErrorMessage(errorDescription || 'Google authorization was canceled or failed.');
                    }
                    return;
                }

                // Check active session from Supabase
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Callback session error:', error);
                    if (isMounted) {
                        setStatus('error');
                        setErrorMessage(error.message || 'Failed to retrieve session from Google.');
                    }
                    return;
                }

                if (session) {
                    handleSessionSuccess(session);
                    return;
                }

                // If session is still propagating, listen for the auth state change event
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
                    if (event === 'SIGNED_IN' && newSession) {
                        handleSessionSuccess(newSession);
                    }
                });

                // Safety timeout: if after 6 seconds no session arrives, display error
                const timer = setTimeout(() => {
                    if (isMounted && status === 'processing') {
                        setStatus('error');
                        setErrorMessage('Authentication timed out. Please try signing in again.');
                    }
                }, 6000);

                return () => {
                    subscription?.unsubscribe();
                    clearTimeout(timer);
                };
            } catch (err) {
                console.error('Callback error:', err);
                if (isMounted) {
                    setStatus('error');
                    setErrorMessage('An unexpected error occurred during Google sign in.');
                }
            }
        };

        const handleSessionSuccess = (session) => {
            const token = session.access_token;
            const refreshToken = session.refresh_token;

            localStorage.setItem('token', token);
            if (refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
            }

            const rawUser = session.user;
            const userObj = {
                id: rawUser.id,
                email: rawUser.email,
                username: rawUser.user_metadata?.username || rawUser.user_metadata?.full_name || rawUser.email?.split('@')[0],
                name: rawUser.user_metadata?.full_name || rawUser.user_metadata?.name || rawUser.email?.split('@')[0],
                avatar_url: rawUser.user_metadata?.avatar_url || rawUser.user_metadata?.picture || null,
            };

            login(userObj, token, refreshToken);

            if (isMounted) {
                setStatus('success');
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 500);
            }
        };

        processAuth();

        return () => {
            isMounted = false;
        };
    }, [navigate, login]);

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
            theme === 'light' ? 'bg-[#F8FAFC]' : 'bg-[#050608]'
        }`}>
            <div className={`max-w-md w-full p-8 rounded-3xl border shadow-2xl text-center ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0B0D11] border-[#181C24]'
            }`}>
                {status === 'processing' && (
                    <div className="flex flex-col items-center gap-4 py-6">
                        <Loader2 className="w-10 h-10 animate-spin text-[#0E7490] dark:text-cyan-400" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Authenticating with Google...
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-[#94A3B8]">
                            Securing your vault session, please wait a moment.
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4 py-6">
                        <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce" />
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Signed in successfully!
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Redirecting to your vault...
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Sign In Failed
                        </h2>
                        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                            {errorMessage}
                        </p>
                        <ThemedButton
                            variant="primary"
                            onClick={() => navigate('/login', { replace: true })}
                            className="mt-2 w-full"
                        >
                            Back to Sign In
                        </ThemedButton>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
