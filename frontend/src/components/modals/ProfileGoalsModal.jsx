import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Target, User, Save, Info } from 'lucide-react';

const OCCUPATIONS = [
  "Software Engineer",
  "Doctor",
  "Teacher",
  "Nurse",
  "Engineer",
  "Accountant",
  "Scientist",
  "Lawyer",
  "Sales Representative",
  "Manager"
];

const BMI_CATEGORIES = [
  "Normal",
  "Overweight",
  "Obese",
  "Normal Weight"
];

export default function ProfileGoalsModal({
  isOpen,
  onClose,
  currentUser,
  currentProfile,
  onSave
}) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    gender: "Female",
    age: 28,
    occupation: "Doctor",
    bmiCategory: "Normal",
    bloodPressure: "120/80",
    sleepDisorder: "None",
    sleepDurationGoal: 8.0,
    dailyStepsGoal: 10000,
    physicalActivityGoal: 60
  });

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        name: currentUser?.name || "",
        gender: currentProfile.gender || "Female",
        age: currentProfile.age || 28,
        occupation: currentProfile.occupation || "Doctor",
        bmiCategory: currentProfile.bmiCategory || "Normal",
        bloodPressure: currentProfile.bloodPressure || "120/80",
        sleepDisorder: currentProfile.sleepDisorder || "None",
        sleepDurationGoal: currentProfile.goals?.sleepDuration ?? 8.0,
        dailyStepsGoal: currentProfile.goals?.dailySteps ?? 10000,
        physicalActivityGoal: currentProfile.goals?.physicalActivity ?? 60
      });
    }
  }, [currentProfile, currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      profile: {
        gender: formData.gender,
        age: Number(formData.age),
        occupation: formData.occupation,
        bmiCategory: formData.bmiCategory,
        bloodPressure: formData.bloodPressure,
        sleepDisorder: formData.sleepDisorder,
        goals: {
          sleepDuration: Number(formData.sleepDurationGoal),
          dailySteps: Number(formData.dailyStepsGoal),
          physicalActivity: Number(formData.physicalActivityGoal)
        }
      }
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile & Wellness Targets"
      subtitle="Customize your baseline lifestyle profile and personal goals."
      maxWidth={640}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Section 1: Configurable Goals */}
        <div
          style={{
            backgroundColor: 'var(--wn-lavender-light)',
            border: '1px solid var(--wn-lavender-subtle)',
            borderRadius: 'var(--wn-radius-md)',
            padding: '18px 20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Target size={18} style={{ color: 'var(--wn-lavender-dark)' }} />
            <h4 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--wn-lavender-dark)' }}>
              Personal Wellness Targets
            </h4>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--wn-text-secondary)', marginBottom: 16 }}>
            Your transparent wellness scores and progress bars dynamically evaluate against these values.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="wn-form-group" style={{ marginBottom: 0 }}>
              <label className="wn-label" style={{ fontSize: 12.5 }}>Sleep Goal</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  max="12"
                  value={formData.sleepDurationGoal}
                  onChange={(e) => setFormData({ ...formData, sleepDurationGoal: e.target.value })}
                  required
                />
                <span style={{ position: 'absolute', right: 10, top: 10, fontSize: 12, color: 'var(--wn-text-muted)' }}>
                  hrs
                </span>
              </div>
            </div>

            <div className="wn-form-group" style={{ marginBottom: 0 }}>
              <label className="wn-label" style={{ fontSize: 12.5 }}>Daily Steps</label>
              <input
                type="number"
                step="500"
                min="3000"
                max="25000"
                value={formData.dailyStepsGoal}
                onChange={(e) => setFormData({ ...formData, dailyStepsGoal: e.target.value })}
                required
              />
            </div>

            <div className="wn-form-group" style={{ marginBottom: 0 }}>
              <label className="wn-label" style={{ fontSize: 12.5 }}>Active Minutes</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="5"
                  min="15"
                  max="180"
                  value={formData.physicalActivityGoal}
                  onChange={(e) => setFormData({ ...formData, physicalActivityGoal: e.target.value })}
                  required
                />
                <span style={{ position: 'absolute', right: 10, top: 10, fontSize: 12, color: 'var(--wn-text-muted)' }}>
                  mins
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Demographic & Lifestyle Baseline */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <User size={18} style={{ color: 'var(--wn-sage)' }} />
            <h4 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--wn-text-primary)' }}>
              Biometric Baseline (Dataset Features)
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="wn-form-group">
              <label className="wn-label">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="wn-form-group">
              <label className="wn-label">Occupation</label>
              <select
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              >
                {OCCUPATIONS.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>

            <div className="wn-form-group">
              <label className="wn-label">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div className="wn-form-group">
              <label className="wn-label">Age</label>
              <input
                type="number"
                min="18"
                max="90"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>

            <div className="wn-form-group">
              <label className="wn-label">BMI Category</label>
              <select
                value={formData.bmiCategory}
                onChange={(e) => setFormData({ ...formData, bmiCategory: e.target.value })}
              >
                {BMI_CATEGORIES.map((bmi) => (
                  <option key={bmi} value={bmi}>{bmi}</option>
                ))}
              </select>
            </div>

            <div className="wn-form-group">
              <label className="wn-label">Blood Pressure Baseline</label>
              <input
                type="text"
                placeholder="e.g. 120/80"
                value={formData.bloodPressure}
                onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 'var(--wn-radius-sm)', backgroundColor: 'var(--wn-surface-subtle)', border: '1px solid var(--wn-border-light)' }}>
          <Info size={15} style={{ color: 'var(--wn-text-muted)', flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: 'var(--wn-text-muted)', margin: 0 }}>
            Stable lifestyle details pre-fill your daily check-in so you only need to record active measurements each day.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
          <button type="button" onClick={onClose} className="wn-btn wn-btn-outline">
            Cancel
          </button>
          <button type="submit" className="wn-btn wn-btn-primary">
            <Save size={16} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
