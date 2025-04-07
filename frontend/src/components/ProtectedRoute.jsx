// import { useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../providers/AuthProvider';

// export default function ProtectedRoute({ children, adminOnly = false }) {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     if (!user) {
//       navigate('/login', { state: { from: location }, replace: true });
//     } else if (adminOnly && !user.is_admin) {
//       navigate('/storage', { replace: true });
//     }
//   }, [user, navigate, location, adminOnly]);

//   if (!user || (adminOnly && !user.is_admin)) {
//     return null;
//   }

//   return children;
// }