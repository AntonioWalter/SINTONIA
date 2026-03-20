import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, KeyRound, AlertTriangle } from 'lucide-react';

const DisclaimerPage = () => {
    const navigate = useNavigate();
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        setTimeout(() => setFadeIn(true), 100);
    }, []);

    const handleAccept = () => {
        navigate('/welcome');
    };

    return (
        <div style={{
            height: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            background: 'var(--secondary-bg)',
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out',
        }}>
            <div className="card" style={{
                flexShrink: 0,
                margin: 'auto 0',
                width: '100%',
                padding: '36px 24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--white)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-60px',
                    left: '-60px',
                    width: '140px',
                    height: '140px',
                    background: 'var(--primary-light)',
                    opacity: '0.15',
                    borderRadius: '50%',
                    filter: 'blur(20px)'
                }} />

                <div style={{
                    width: '76px',
                    height: '76px',
                    background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-dark) 100%)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 28px',
                    boxShadow: '0 12px 24px rgba(15, 62, 77, 0.25)',
                    transform: 'rotate(-5deg)',
                    zIndex: 1
                }}>
                    <ShieldAlert size={38} color="white" style={{ transform: 'rotate(5deg)' }} />
                </div>

                <h1 style={{
                    fontSize: '26px',
                    fontWeight: '800',
                    color: 'var(--primary-dark)',
                    marginBottom: '14px',
                    letterSpacing: '-0.5px',
                    zIndex: 1
                }}>
                    Prototipo Didattico
                </h1>

                <p style={{
                    fontSize: '15px',
                    color: 'var(--text-gray)',
                    lineHeight: '1.5',
                    marginBottom: '32px',
                    fontWeight: '600',
                    zIndex: 1
                }}>
                    Questo applicativo è interamente dedicato a scopi didattici. Il login ministeriale con lo SPID è <strong>simulato e non reale</strong>.
                </p>

                <div style={{
                    textAlign: 'left',
                    background: '#f8fdfd',
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '28px',
                    border: '1px solid var(--primary-light)',
                    width: '100%',
                    zIndex: 1
                }}>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        color: 'var(--primary-dark)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <KeyRound size={18} /> Account di Prova
                    </h3>

                    <div style={{ background: 'white', padding: '16px', borderRadius: '14px', border: '1px solid #efefef', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontWeight: '800', color: 'var(--primary-dark)', fontSize: '15px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-orange)'}} /> 
                            Tester Paziente
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <code style={{ background: '#f5f9fa', padding: '8px 12px', borderRadius: '8px', color: 'var(--primary-dark)', fontWeight: '800', fontSize: '15px', border: '1px solid #e1e8ed', letterSpacing: '-0.2px' }}>chiara.conti@gmail.com</code>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span style={{ color: '#888', fontSize: '14px', fontWeight: '700' }}>Pass:</span>
                                <code style={{ color: 'var(--primary-dark)', fontWeight: '800', fontSize: '15px', background: '#f5f9fa', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e1e8ed', letterSpacing: '0.5px' }}>password123</code>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px', background: '#fff9f5', padding: '16px', borderRadius: '16px', border: '1px dashed var(--accent-orange)', width: '100%', zIndex: 1 }}>
                    <AlertTriangle size={24} color="var(--accent-orange)" style={{ flexShrink: 0 }} />
                    <p style={{
                        fontSize: '13px',
                        color: '#d1531e',
                        margin: 0,
                        fontWeight: '800',
                        textAlign: 'left',
                        lineHeight: '1.4'
                    }}>
                        Non inserire MAI i tuoi dati personali o vere chiavi di identità digitale in questa app.
                    </p>
                </div>

                <button
                    onClick={handleAccept}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: 'var(--primary-dark)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '16px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 8px 20px rgba(15, 62, 77, 0.25)',
                        transition: 'transform 0.2s',
                        zIndex: 1
                    }}
                >
                    Accetto e procedo <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default DisclaimerPage;
