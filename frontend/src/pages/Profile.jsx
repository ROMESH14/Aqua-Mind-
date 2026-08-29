import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileOk, setProfileOk] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordOk, setPasswordOk] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileOk('');
    setSavingProfile(true);
    try {
      await updateProfile(profile.username.trim(), profile.email.trim());
      setProfileOk('Profile saved.');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordOk('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordOk('Password updated.');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="page-screen">
      <div className="page">
        <PageHero eyebrow="Account" title="Profile" subtitle="Update your name, email, and password">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Sign out
          </button>
        </PageHero>

        <div className="profile-grid">
          <form className="card profile-card" onSubmit={handleProfile}>
            <h2>Account details</h2>
            <p>This name appears on the dashboard and in your tanks.</p>
            {profileError && <div className="form-error">{profileError}</div>}
            {profileOk && <div className="form-success">{profileOk}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-username">Username</label>
              <input
                id="profile-username"
                className="form-input"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                className="form-input"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save profile'}
            </button>
          </form>

          <form className="card profile-card" onSubmit={handlePassword}>
            <h2>Change password</h2>
            <p>Use at least 6 characters for the new password.</p>
            {passwordError && <div className="form-error">{passwordError}</div>}
            {passwordOk && <div className="form-success">{passwordOk}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-current">Current password</label>
              <input
                id="profile-current"
                className="form-input"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-new">New password</label>
              <input
                id="profile-new"
                className="form-input"
                type="password"
                minLength={6}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-confirm">Confirm new password</label>
              <input
                id="profile-confirm"
                className="form-input"
                type="password"
                minLength={6}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={savingPassword}>
              {savingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
