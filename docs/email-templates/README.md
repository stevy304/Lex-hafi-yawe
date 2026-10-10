# Lex Hafi Yawe — Transactional Email Templates

All email templates use inline styles according to the Lex Hafi Yawe design token specification:
- **Header**: Navy `#12305A` with Lex Hafi Yawe branding
- **Accent**: Burnt Orange `#D2691E` and Gold `#C9A24B`
- **Background**: Warm Cream `#F4EFE3` and White `#FFFFFF` card
- **Footer**: Standard support contacts with zero tracking pixels

---

## 1. verify-email-code
- **EN Subject**: Your Lex Hafi Yawe verification code is {{code}}
  - **Body**: Hello {{name}}, enter this 6-digit confirmation code on Lex Hafi Yawe: **{{code}}**. Expires in 10 minutes.
- **RW Subject (Needs native review)**: Kode yawe yo kwemeza imeyili kuri Lex Hafi Yawe ni {{code}}
  - **Body**: Muraho {{name}}, andika iyi kode y'imibare 6 kuri Lex Hafi Yawe: **{{code}}**. Irangira mu minota 10.
- **FR Subject**: Votre code de vérification Lex Hafi Yawe est {{code}}
  - **Body**: Bonjour {{name}}, veuillez saisir ce code à 6 chiffres sur Lex Hafi Yawe : **{{code}}**. Expire dans 10 minutes.

---

## 2. welcome
- **EN Subject**: Welcome to Lex Hafi Yawe, {{name}}
  - **Body**: Your account is active. Connect with verified advocates and access Rwanda legislation.
- **RW Subject**: Murakaza neza kuri Lex Hafi Yawe, {{name}}
  - **Body**: Konti yawe yamaze gufungurwa. Komeza ku rubuga wunguke ubumenyi mu by'amategeko.
- **FR Subject**: Bienvenue sur Lex Hafi Yawe, {{name}}
  - **Body**: Votre compte est activé. Accédez aux avocats vérifiés et aux lois officielles.

---

## 3. account-exists
- **EN Subject**: An account already exists for this email
  - **Body**: An attempt was made to register with {{email}}. If you already have an account, you can sign in directly at {{link}}.
- **RW Subject**: Iyi meyili isanzwe ifite konti kuri Lex Hafi Yawe
  - **Body**: Hari uwagerageje gufungura konti akoresheje iyi meyili. Niba ari wowe, ushobora kwinjira ako kanya kuri {{link}}.
- **FR Subject**: Un compte existe déjà avec cette adresse e-mail
  - **Body**: Une tentative d'inscription a été effectuée. Si vous possédez déjà un compte, connectez-vous directement sur {{link}}.

---

## 4. password-reset
- **EN Subject**: Reset your Lex Hafi Yawe password
  - **Body**: Click {{link}} to choose a new password. If you didn't request this, your account is secure.
- **RW Subject**: Gusubiramo ijambobanga ryawe rya Lex Hafi Yawe
  - **Body**: Kanda kuri {{link}} uhitemo ijambobanga rishya.
- **FR Subject**: Réinitialisez votre mot de passe Lex Hafi Yawe
  - **Body**: Cliquez sur {{link}} pour définir un nouveau mot de passe.

---

## 5. password-changed
- **EN Subject**: Your Lex Hafi Yawe password was updated
  - **Body**: Your password was updated. All other active sessions have been logged out. Contact {{support_email}} if unexpected.
- **RW Subject**: Ijambobanga ryawe ryahinduwe
  - **Body**: Ijambobanga ryawe ryamaze guhindurwa. Ahandi hose wari ufunguye hasohotse.
- **FR Subject**: Votre mot de passe Lex Hafi Yawe a été mis à jour
  - **Body**: Votre mot de passe a été modifié avec succès. Toutes vos autres sessions ont été déconnectées.

---

## 6. new-device-login
- **EN Subject**: New login detected on {{device}}
  - **Body**: A new sign-in was detected from {{device}} in {{location}}. If this was you, no action is needed.
- **RW Subject**: Kwinjira gushya kwagaragaye ku gikoresho {{device}}
  - **Body**: Hari uwongeye kwinjira akoresheje {{device}}. Niba ari wowe nta kindi gikenewe.
- **FR Subject**: Nouvelle connexion détectée sur {{device}}
  - **Body**: Une nouvelle connexion a été détectée sur votre compte depuis {{device}} à {{location}}.

---

## 7. advocate-approved
- **EN Subject**: Congratulations: Your advocate verification is approved
  - **Body**: Hello {{name}}, the Rwanda Bar Association credentials for roll number {{barRollNumber}} have been verified. Your profile now displays the official advocate badge.
- **RW Subject**: Ubusabe bwawe bwo kuba umuvoka wemejwe bwemejwe
  - **Body**: Muraho {{name}}, imyirondoro yawe mu Rugaga rw'Abavoka (RBA) yemejwe. Konti yawe ubu ifite ikimenyetso cy'umuvoka wemewe.
- **FR Subject**: Félicitations : Votre statut d'avocat vérifié est approuvé
  - **Body**: Bonjour {{name}}, votre inscription au barreau a été authentifiée. Votre profil dispose désormais du badge officiel.

---

## 8. advocate-rejected
- **EN Subject**: Update regarding your advocate application
  - **Body**: Hello {{name}}, your advocate application could not be verified: {{reason}}. You may apply again from {{link}}.
- **RW Subject**: Amakuru ku busabe bwawe bwo kwemezwa nk'umuvoka
  - **Body**: Muraho {{name}}, ubusabe bwawe ntabwo bwemejwe: {{reason}}. Ushobora kongera gusaba unyuze kuri {{link}}.
- **FR Subject**: Information concernant votre demande d'avocat vérifié
  - **Body**: Bonjour {{name}}, votre demande n'a pas pu être validée pour le motif suivant : {{reason}}.

---

## 9. deletion-scheduled
- **EN Subject**: Account deletion scheduled (30-day grace period)
  - **Body**: Your Lex Hafi Yawe account is scheduled for deletion on {{scheduledFor}}. You can cancel anytime before this date at {{link}}.
- **RW Subject**: Isibwa rya konti yawe ryateganyijwe (iminsi 30 y'imbabazi)
  - **Body**: Konti yawe izasibwa burundu ku wa {{scheduledFor}}. Ushobora kubihagarika igihe icyo ari cyo cyose unyuze kuri {{link}}.
- **FR Subject**: Suppression de compte programmée (délai de grâce de 30 jours)
  - **Body**: Votre compte sera définitivement supprimé le {{scheduledFor}}. Vous pouvez annuler cette procédure à tout moment sur {{link}}.

---

## 10. deletion-cancelled
- **EN Subject**: Account deletion cancelled
  - **Body**: Your account deletion request has been cancelled. Your account and data remain active.
- **RW Subject**: Isibwa rya konti ryahagaritswe
  - **Body**: Icyifuzo cyo gusiba konti cyahagaritswe. Konti yawe n'amakuru yawe bikomeje gukora bisanzwe.
- **FR Subject**: Suppression de compte annulée
  - **Body**: Votre demande de suppression a été annulée. Votre compte et vos données demeurent inchangés.

---

## 11. export-ready
- **EN Subject**: Your Lex Hafi Yawe data archive is ready for download
  - **Body**: Your requested personal data archive is ready. Download it at {{link}}. This link expires in 24 hours.
- **RW Subject**: Dosiyeri y'amakuru yawe iriteguye
  - **Body**: Dosiyeri y'amakuru yawe iriteguye kuyikuraho kuri {{link}}. Iri huza rirangira mu masaha 24.
- **FR Subject**: Votre archive de données Lex Hafi Yawe est prête
  - **Body**: Votre archive de données personnelles est disponible au téléchargement sur {{link}}. Ce lien expire dans 24 heures.
