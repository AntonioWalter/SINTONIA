import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, AlertTriangle, KeyRound } from 'lucide-react';

const DisclaimerPage = () => {
    const navigate = useNavigate();

    return (
        <div className="disclaimer-wrapper">
            <style>
                {`
                .disclaimer-wrapper {
                    height: 100vh;
                    overflow-y: auto;
                    overflow-x: hidden;
                    background: var(--color-background);
                    font-family: 'Urbanist', sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 40px 20px;
                    box-sizing: border-box;
                }
                .disclaimer-card {
                    flex-shrink: 0; /* Prevents card from shrinking to fit 100vh */
                    margin: auto 0; /* Centers it if there's space, but starts from top if not */
                    width: 100%;
                    max-width: 980px;
                    background: var(--color-card);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                    border: '1px solid var(--color-border-light)';
                    display: flex;
                    flex-direction: row;
                    padding: 56px 64px;
                    gap: 64px;
                    position: relative;
                    overflow: hidden;
                }
                @media (max-width: 900px) {
                    .disclaimer-wrapper {
                        padding: 20px;
                        display: block; /* Fallback to block on mobile for simpler scrolling */
                    }
                    .disclaimer-card {
                        flex-direction: column;
                        padding: 40px 32px;
                        gap: 40px;
                        margin: 0 auto;
                    }
                }
                @media (max-width: 480px) {
                    .disclaimer-card {
                        padding: 32px 20px;
                        gap: 32px;
                    }
                }
                `}
            </style>
            <div className="disclaimer-card">
                {/* Decorative background element */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    left: '-100px',
                    width: '300px',
                    height: '300px',
                    background: 'var(--color-teal-light)',
                    opacity: '0.15',
                    borderRadius: '50%',
                    filter: 'blur(50px)'
                }} />

                {/* LEFT COLUMN: Main Info & Warnings */}
                <div style={{ flex: '1 1 50%', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                    <div style={{
                        width: '88px',
                        height: '88px',
                        background: 'linear-gradient(135deg, var(--color-teal-medium) 0%, var(--color-teal-dark) 100%)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '32px',
                        boxShadow: '0 12px 24px rgba(26, 95, 95, 0.25)',
                        transform: 'rotate(-5deg)'
                    }}>
                        <ShieldAlert size={44} color="white" style={{ transform: 'rotate(5deg)' }} />
                    </div>

                    <h1 style={{
                        fontSize: '34px',
                        fontWeight: '800',
                        color: 'var(--color-teal-dark)',
                        marginBottom: '20px',
                        letterSpacing: '-0.5px'
                    }}>
                        Avviso Prototipo Didattico
                    </h1>

                    <p style={{
                        fontSize: '17px',
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                        marginBottom: '32px',
                        fontWeight: '500'
                    }}>
                        Benvenuto in <strong>Sintonia</strong>. Questo portale è un prototipo sviluppato esclusivamente per scopi clinici e didattici. L'integrazione con i sistemi governativi (SPID) è <strong>puramente simulata</strong>.
                    </p>

                    <div style={{ background: '#fff5f5', borderLeft: '4px solid var(--color-delete)', padding: '16px 20px', borderRadius: '0 8px 8px 0', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <AlertTriangle size={28} color="var(--color-delete)" style={{flexShrink: 0}} />
                        <span style={{ fontSize: '14px', color: '#c62828', fontWeight: '700', lineHeight: '1.5' }}>
                            Non inserire MAI i tuoi dati personali, la tua vera identità digitale (SPID) o CIE su questo applicativo demo.
                        </span>
                    </div>
                </div>

                {/* RIGHT COLUMN: Credentials & Action */}
                <div style={{ flex: '1 1 50%', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        textAlign: 'left',
                        background: '#f8fdfd',
                        borderRadius: 'var(--radius-lg)',
                        padding: '32px',
                        marginBottom: '32px',
                        border: '1px solid var(--color-teal-light)'
                    }}>
                        <h3 style={{
                            fontSize: '15px',
                            fontWeight: '800',
                            color: 'var(--color-teal-dark)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <KeyRound size={20} /> Credenziali di Autenticazione
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontWeight: '800', color: 'var(--color-teal-dark)', fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{width: 10, height: 10, borderRadius: '50%', background: 'var(--color-teal-accent)'}} /> 
                                    Accesso Amministratore
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ color: '#888', fontSize: '14px', fontWeight: '700' }}>Email</span>
                                    <code style={{ color: '#1A5F5F', fontWeight: '800', fontFamily: 'monospace', fontSize: '15px', letterSpacing: '-0.3px', background: '#f5f5f5', padding: '4px 8px', borderRadius: '6px' }}>alessio.delsorbo@gmail.com</code>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#888', fontSize: '14px', fontWeight: '700' }}>Password</span>
                                    <code style={{ color: '#1A5F5F', fontWeight: '800', fontFamily: 'monospace', fontSize: '15px', background: '#f5f5f5', padding: '4px 8px', borderRadius: '6px' }}>password1</code>
                                </div>
                            </div>

                            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontWeight: '800', color: 'var(--color-teal-dark)', fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{width: 10, height: 10, borderRadius: '50%', background: 'var(--color-approved)'}} /> 
                                    Accesso Psicologo (Tasto SPID)
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ color: '#888', fontSize: '14px', fontWeight: '700' }}>Email</span>
                                    <code style={{ color: '#1A5F5F', fontWeight: '800', fontFamily: 'monospace', fontSize: '15px', letterSpacing: '-0.3px', background: '#f5f5f5', padding: '4px 8px', borderRadius: '6px' }}>l.bruno@pec.aslnapoli1centro.it</code>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#888', fontSize: '14px', fontWeight: '700' }}>Password</span>
                                    <code style={{ color: '#1A5F5F', fontWeight: '800', fontFamily: 'monospace', fontSize: '15px', background: '#f5f5f5', padding: '4px 8px', borderRadius: '6px' }}>password123</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            width: '100%',
                            padding: '20px',
                            background: 'var(--color-teal-dark)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: '18px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.2s',
                            boxShadow: '0 8px 24px rgba(26, 95, 95, 0.25)',
                            marginTop: 'auto'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 28px rgba(26, 95, 95, 0.35)';
                            e.currentTarget.style.background = 'var(--color-teal-medium)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(26, 95, 95, 0.25)';
                            e.currentTarget.style.background = 'var(--color-teal-dark)';
                        }}
                    >
                        Accetto e procedo al Login <ArrowRight size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisclaimerPage;
