# User Object Documentation
The `User` object holds all the information for a single user of your application. It provides methods to manage the user's account, retrieve information, and update attributes.

## Overview
Each user has:
- A unique authentication identifier (email, phone number, or username).
- Primary and secondary contact information (email, phone numbers).
- External accounts (e.g., Google, Apple, Facebook).
- Profile data like name, profile picture, and metadata.

### Metadata Types:
- **Public Metadata**: Accessible from both Frontend and Backend APIs.
- **Private Metadata**: Accessible only from the Backend API.
- **Unsafe Metadata**: Readable and writable from the Frontend API.
The `ClerkJS SDK` provides helper methods to retrieve and update user information and authentication status.

---

## Properties

### Identification
- **id**: `string` - Unique user identifier.
- **username**: `string | null` - User's username.

### Profile
- **firstName**: `string | null` - User's first name.
- **lastName**: `string | null` - User's last name.
- **fullName**: `string | null` - User's full name.
- **imageUrl**: `string` - URL for user's profile image or avatar.
- **hasImage**: `boolean` - Indicates if the user has an uploaded image.

### Contact Information
- **primaryEmailAddress**: `EmailAddress | null` - Primary email address info.
- **primaryEmailAddressId**: `string | null` - ID for the primary email address.
- **emailAddresses**: `EmailAddress[]` - Array of all associated email addresses.
- **hasVerifiedEmailAddress**: `boolean` - Whether a verified email exists.
- **primaryPhoneNumber**: `PhoneNumber | null` - Primary phone number info.
- **primaryPhoneNumberId**: `string | null` - ID for the primary phone number.
- **phoneNumbers**: `PhoneNumber[]` - Array of all associated phone numbers.
- **hasVerifiedPhoneNumber**: `boolean` - Whether a verified phone number exists.

### Authentication
- **passkeys**: `PasskeyResource[] | null` - Associated passkeys.
- **passwordEnabled**: `boolean` - Indicates if the user has a password.
- **totpEnabled**: `boolean` - Indicates if TOTP is enabled.
- **twoFactorEnabled**: `boolean` - Indicates if two-factor authentication is enabled.
- **backupCodeEnabled**: `boolean` - Indicates if backup codes are enabled.

### Metadata
- **publicMetadata**: `UserPublicMetadata` - Public metadata settable via Backend API.
- **privateMetadata**: `UserPrivateMetadata` - Private metadata settable via Backend API.
- **unsafeMetadata**: `UserUnsafeMetadata` - Metadata settable via Frontend API.

### External Accounts
- **web3Wallets**: `Web3Wallet[]` - Array of associated Web3 wallets.
- **externalAccounts**: `ExternalAccount[]` - Array of OAuth external accounts.
- **verifiedExternalAccounts**: `ExternalAccount[]` - Verified external accounts.
- **unverifiedExternalAccounts**: `ExternalAccount[]` - Unverified external accounts.
- **samlAccounts**: `SamlAccount[]` - Experimental list of SAML accounts.

### Organization Management
- **organizationMemberships**: `OrganizationMembership[]` - Organizations the user belongs to.
- **createOrganizationEnabled**: `boolean` - Whether the user can create organizations.
- **createOrganizationsLimit**: `number` - Limit on the number of organizations the user can create.

### Other Properties
- **legalAcceptedAt**: `Date` - Date of legal document acceptance.
- **lastSignInAt**: `Date | null` - Last sign-in date.
- **createdAt**: `Date` - User creation date.
- **updatedAt**: `Date` - Last update date.

---

## Methods

### Update User Attributes
```javascript
function update(params: UpdateUserParams): Promise<User>
```
Updates user attributes such as `firstName`, `lastName`, and metadata.

**Example**:
```javascript
await clerk.user.update({ firstName: 'Test' });
```

### Delete User
```javascript
function delete(): Promise<void>
```
Deletes the current user.

**Example**:
```javascript
await clerk.user.delete();
```

### Manage Profile Image
```javascript
function setProfileImage(params: SetProfileImageParams): Promise<ImageResource>
```
Sets or updates the user's profile image.

**Example**:
```javascript
const file = document.getElementById('profile-image').files[0];
await clerk.user.setProfileImage({ file });
```

### Reload User Data
```javascript
function reload(p?: ClerkResourceReloadParams): Promise<this>
```
Refreshes the user's data from Clerk's API.

### Manage Sessions
```javascript
function getSessions(): Promise<SessionWithActivities[]>
```
Retrieves all active sessions for the user.

---

## Additional Methods
- **createPasskey**: Creates a passkey for the user.
- **createTOTP / verifyTOTP / disableTOTP**: Manage TOTP.
- **updatePassword / removePassword**: Manage passwords.
- **createEmailAddress / PhoneNumber / Web3Wallet / ExternalAccount**: Add new contact methods or accounts.

---

## Utility Examples

### Upload a Profile Image
**HTML**:
```html
<input type="file" id="profile-image" />
<button id="upload-button">Upload</button>
```

**JavaScript**:
```javascript
const fileInput = document.getElementById('profile-image');
const uploadButton = document.getElementById('upload-button');

uploadButton.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (file) {
    await clerk.user.setProfileImage({ file });
    console.log('Profile image updated!');
  }
});
```

### Retrieve Active Sessions
```javascript
const sessions = await clerk.user.getSessions();
console.log('Active sessions:', sessions);
```

### Delete a User
```javascript
await clerk.user.delete();
console.log('User deleted.');
```

---

## Notes
- Ensure you initialize `Clerk` with the correct publishable key.
- All updates and modifications depend on settings configured in the Clerk Dashboard.
- Metadata is a powerful tool for extending user attributes with custom fields.

This documentation covers key features of the `User` object and its methods. Integrating these into your application will streamline user management and enhance functionality.

