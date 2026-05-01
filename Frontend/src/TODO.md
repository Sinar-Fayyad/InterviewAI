# Refactor Profile to Use Onboarding Components

## Task
Change Profile page to use components from Onboarding while keeping Profile's individual CRUD functionality.

## Steps - COMPLETED

### 1. Update Onboarding Types ✅
- Added `ComponentMode` type: "onboarding" | "profile"

### 2. Modify BasicInfoStep.tsx ✅
- Added mode, userId, onSave props
- Added edit/save buttons for profile mode
- Individual CRUD via updateUser API

### 3. Modify EducationStep.tsx ✅
- Added mode, userId, onUpdateList props
- Added edit/save/delete buttons for profile mode
- Individual CRUD via addEducation, updateEducation, deleteEducation APIs

### 4. Modify ExperienceStep.tsx ✅
- Added mode, userId, onUpdateList props
- Added edit/save/delete buttons for profile mode
- Individual CRUD via addExperience, updateExperience, deleteExperience APIs

### 5. Modify CertificationsStep.tsx ✅
- Added mode, userId, onUpdateList props
- Added edit/save/delete buttons for profile mode
- Individual CRUD via addCertification, updateCertification, deleteCertification APIs

### 6. Modify SkillsStep.tsx ✅
- Added mode, userId, onUpdateList props
- Added inline edit/save/delete for profile mode
- Individual CRUD via addSkill, updateSkill, deleteSkill APIs

### 7. Modify ConnectAccountsStep.tsx ✅
- Added mode, userId, onUpdate props
- Different button variants for profile mode

### 8. Update Profile.tsx ✅
- Imports onboarding components
- Pass mode="profile" and CRUD callbacks
- Removed old profile component imports

### 9. Delete Profile Components ✅
- All old profile folder components deleted
