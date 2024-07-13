import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from './components/NavBar';
import './App.css';

const Signup = lazy(() => import('./components/Signup'));
const Login = lazy(() => import('./components/Login'));
const Home = lazy(() => import('./components/Home'));
const CreateMeeting = lazy(() => import('./components/CreateMeeting'));
const ManageMeetings = lazy(() => import('./components/ManageMeetings'));
const JoinMeetingLink = lazy(() => import('./components/JoinMeetingLink'));
const VideoMeeting = lazy(() => import('./components/VideoMeeting'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const ScheduleMeeting = lazy(() => import('./components/ScheduleMeeting'));
const Contact = lazy(() => import('./components/Contact'));
const History = lazy(() => import('./components/History'));
const Messages = lazy(() => import('./components/Messages'));
const Notification = lazy(() => import('./components/Notification'));
const Profile = lazy(() => import('./components/Profile'));
const Calls = lazy(() => import('./components/Calls'));

const AppLayout = ({ children }) => {
    const [dateTime, setDateTime] = React.useState(new Date());
    const [activePage, setActivePage] = React.useState('');

    React.useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="app-layout">
            <NavBar activePage={activePage} setActivePage={setActivePage} dateTime={dateTime} />
            <div className="app-content">
                {children}
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <div className="App">
                <ToastContainer />
                <Suspense fallback={<div>Chargement...</div>}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/landing" replace />} />
                        <Route path="/landing" element={<LandingPage />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
                        <Route path="/create-meeting" element={<AppLayout><CreateMeeting /></AppLayout>} />
                        <Route path="/join-meeting" element={<AppLayout><JoinMeetingLink /></AppLayout>} />
                        <Route path="/manage-meetings" element={<AppLayout><ManageMeetings /></AppLayout>} />
                        <Route path="/schedule-meeting" element={<AppLayout><ScheduleMeeting /></AppLayout>} />
                        <Route path="/video-meeting/:id" element={<AppLayout><VideoMeeting /></AppLayout>} />
                        <Route path="/contacts" element={<AppLayout><Contact /></AppLayout>} />
                        <Route path="/history" element={<AppLayout><History /></AppLayout>} />
                        <Route path="/messages/:contactEmail" element={<AppLayout><Messages /></AppLayout>} />
                        <Route path="/notifications" element={<AppLayout><Notification /></AppLayout>} />
                        <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
                        <Route path="/calls" element={<AppLayout><Calls /></AppLayout>} />
                    </Routes>
                </Suspense>
            </div>
        </Router>
    );
};

export default App;
