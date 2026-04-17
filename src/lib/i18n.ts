export type StaffLocale = "en" | "fr-CA";

type StaffCopy = {
  navSell: string;
  navOrders: string;
  navAdmin: string;
  settings: string;
  logout: string;
  guest: string;
  login: string;
  openNavigation: string;
  closeNavigation: string;
  searchPlaceholder: string;
  regionLanguage: string;
  regionLabel: string;
  languageLabel: string;
  loadSellingContextError: string;
  loadCatalog: string;
  saleCompleted: string;
  orderSavedReceiptQueued: string;
  currentCart: string;
  itemSingular: string;
  itemPlural: string;
  total: string;
  checkout: string;
  reviewCart: string;
  readyToCheckout: string;
  close: string;
  currentSale: string;
  cart: string;
  addItemsToStartSale: string;
  each: string;
  proceedToCheckout: string;
  customer: string;
  completeSale: string;
  customerNamePlaceholder: string;
  emailAddressPlaceholder: string;
  phoneOptionalPlaceholder: string;
  cartIsEmpty: string;
  customerNameEmailRequired: string;
  confirmPaymentFirst: string;
  unableToCompleteSale: string;
  paymentReceived: string;
  awaitingPinpad: string;
  pinpadHint: string;
  markPaymentReceived: string;
  reset: string;
  confirmCheckout: string;
  submitting: string;
  backToCart: string;
  clearCart: string;
  orderSummary: string;
  recentSales: string;
  subtotal: string;
  tax: string;
  yourCompletedOrders: string;
  yourCompletedOrdersDescription: string;
  order: string;
  orderDetails: string;
  saleInfo: string;
  status: string;
  paymentNote: string;
  lineItems: string;
  qty: string;
  unit: string;
  updateEmail: string;
  saveEmail: string;
  saving: string;
  cancel: string;
  customerEmailUpdated: string;
  unableToUpdateCustomerEmail: string;
  unableToResendReceipt: string;
  receiptResentTo: string;
  noOrdersFound: string;
  walkInCustomer: string;
  noEmailProvided: string;
  noPhoneProvided: string;
  receiptAndTotals: string;
  receipt: string;
  recipient: string;
  resendReceipt: string;
  sending: string;
  noCustomerEmailOnFile: string;
  settingsTitle: string;
  settingsDescription: string;
  profileContext: string;
  defaultSellingContext: string;
  defaultSellingContextDescription: string;
  preferences: string;
  cashierSettings: string;
  saveSettings: string;
  preferencesSaved: string;
  unableToSavePreferences: string;
  firstTimeSetup: string;
  setSellingPreferences: string;
  setupDescription: string;
  appliedAutomatically: string;
  appliedTaxes: string;
  appliedCurrency: string;
  appliedTemplates: string;
  appliedLanguage: string;
  savePreferences: string;
  loginEyebrow: string;
  authBrandSubtitle: string;
  loginHeroTitle: string;
  loginHeroDescription: string;
  demoCredentials: string;
  signInTitle: string;
  emailLabel: string;
  passwordLabel: string;
  forgotPassword: string;
  signIn: string;
  signingIn: string;
  unableToSignIn: string;
  ssoRolloutPath: string;
  openDemoCatalog: string;
  invalidCredentials: string;
  demoAccessCta: string;
  needLocalAccount: string;
  registerAccountCta: string;
  registerHeroTitle: string;
  registerHeroDescription: string;
  localAccountAccess: string;
  localAccountRoleNote: string;
  localAccountAdminNote: string;
  registerEyebrow: string;
  registerTitle: string;
  firstNameLabel: string;
  lastNameLabel: string;
  confirmPasswordLabel: string;
  createAccount: string;
  creatingAccount: string;
  alreadyHaveAccount: string;
  forgotPasswordEyebrow: string;
  forgotPasswordTitle: string;
  forgotPasswordDescription: string;
  sendResetLink: string;
  sendingResetLink: string;
  unableToSendResetInstructions: string;
  resetLinkSent: string;
  rememberedPassword: string;
  backToLogin: string;
  resetPasswordEyebrow: string;
  resetPasswordTitle: string;
  resetPasswordDescription: string;
  resetLinkIncomplete: string;
  newPasswordLabel: string;
  newPasswordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  updatePassword: string;
  updatingPassword: string;
  unableToResetPassword: string;
  passwordUpdatedRedirecting: string;
  needAnotherResetLink: string;
  requestNewResetLink: string;
  adminEyebrow: string;
  adminTitle: string;
  adminDescription: string;
  ordersToday: string;
  receiptSuccess: string;
  activeProducts: string;
  countriesLabel: string;
  catalogManagement: string;
  catalogManagementDetail: string;
  orderHistory: string;
  orderHistoryDetail: string;
  emailTemplatesTitle: string;
  emailTemplatesDetail: string;
  countrySettingsTitle: string;
  countrySettingsDetail: string;
  catalogEyebrow: string;
  manageSellableInventory: string;
  manageSellableInventoryDescription: string;
  addProduct: string;
  ordersEyebrow: string;
  allOrdersTitle: string;
  allOrdersDescription: string;
  exportCsv: string;
  recentOrderHistory: string;
  configurationEyebrow: string;
  configurationTitle: string;
  configurationDescription: string;
  emailTemplatesEyebrow: string;
  localizedReceiptContent: string;
  localizedReceiptContentDescription: string;
  orderSupport: string;
  sent: string;
  resent: string;
  notYet: string;
  never: string;
  cashier: string;
  country: string;
  payment: string;
  noCountriesFound: string;
  selectedCountry: string;
  countrySettingsSaved: string;
  unableToSaveCountrySettings: string;
  countryConfiguration: string;
  countriesTitle: string;
  saveChanges: string;
  countryName: string;
  companyNameLabel: string;
  currency: string;
  defaultLocaleLabel: string;
  defaultLanguageLabel: string;
  pricesIncludeTax: string;
  countryActive: string;
  legalLabel: string;
  receiptFooter: string;
  taxesEyebrow: string;
  taxRulesTitle: string;
  addRule: string;
  createRule: string;
  editRule: string;
  category: string;
  codeLabel: string;
  nameLabel: string;
  ratePercent: string;
  effectiveFrom: string;
  effectiveTo: string;
  compoundRule: string;
  ruleActive: string;
  saveRule: string;
  taxRuleSaved: string;
  unableToSaveTaxRule: string;
  noTaxRuleSelected: string;
  unableToSaveCatalogItem: string;
  noCatalogItemsFound: string;
  descriptionLabel: string;
  basePriceLabel: string;
  taxCategoryLabel: string;
  statusLabel: string;
  activeLabel: string;
  archivedLabel: string;
  marketsLabel: string;
  actionsLabel: string;
  editCatalogItem: string;
  productAvailabilityDescription: string;
  activeInCatalog: string;
  inactiveInCatalog: string;
  overridePriceLabel: string;
  productActiveSellable: string;
  customerAndOrder: string;
  totalsAndMarketContext: string;
  receiptBlocks: string;
  unableToSaveTemplate: string;
  unableToCreateTemplate: string;
  templateSaved: string;
  templateCreated: string;
  noTemplatesFound: string;
  templates: string;
  receiptTemplateEditor: string;
  receiptTemplateEditorDescription: string;
  currentTemplate: string;
  activeTemplate: string;
  inactiveTemplate: string;
  templateBody: string;
  saveTemplate: string;
  resetToRecommendedLayout: string;
  visualEditor: string;
  htmlSource: string;
  htmlModeHint: string;
  visualModeHint: string;
  livePreview: string;
  livePreviewDescription: string;
  createTemplateTitle: string;
  newReceiptTemplate: string;
  newTemplateDescription: string;
  templateName: string;
  emailSubject: string;
  starterLayout: string;
  starterLayoutDescription: string;
  creating: string;
  theme: string;
  lightMode: string;
  darkMode: string;
};

const en: StaffCopy = {
  navSell: "Sell",
  navOrders: "Orders",
  navAdmin: "Admin",
  settings: "Settings",
  logout: "Logout",
  guest: "Guest",
  login: "Login",
  openNavigation: "Open navigation",
  closeNavigation: "Close navigation",
  searchPlaceholder: "Search products or SKU",
  regionLanguage: "Region",
  regionLabel: "Province / state",
  languageLabel: "Language",
  loadSellingContextError: "Unable to load selling context.",
  loadCatalog: "Loading catalog...",
  saleCompleted: "Sale completed",
  orderSavedReceiptQueued: "Order saved successfully. Receipt queued for delivery if an email was entered.",
  currentCart: "Current cart",
  itemSingular: "item",
  itemPlural: "items",
  total: "Total",
  checkout: "Checkout",
  reviewCart: "Review cart",
  readyToCheckout: "Ready to checkout",
  close: "Close",
  currentSale: "Current Sale",
  cart: "Cart",
  addItemsToStartSale: "Add items to start a sale.",
  each: "each",
  proceedToCheckout: "Proceed To Checkout",
  customer: "Customer",
  completeSale: "Complete sale",
  customerNamePlaceholder: "Customer name",
  emailAddressPlaceholder: "Email address",
  phoneOptionalPlaceholder: "Phone (optional)",
  cartIsEmpty: "Cart is empty.",
  customerNameEmailRequired: "Customer name and email are required.",
  confirmPaymentFirst: "Confirm payment on the external pinpad before checkout.",
  unableToCompleteSale: "Unable to complete sale.",
  paymentReceived: "Payment marked as received",
  awaitingPinpad: "Awaiting external pinpad payment",
  pinpadHint: "Use this only after the pinpad transaction is approved in front of the customer.",
  markPaymentReceived: "Mark Payment Received",
  reset: "Reset",
  confirmCheckout: "Confirm Checkout",
  submitting: "Submitting...",
  backToCart: "Back To Cart",
  clearCart: "Clear Cart",
  orderSummary: "Order summary",
  recentSales: "Recent sales",
  subtotal: "Subtotal",
  tax: "Tax",
  yourCompletedOrders: "Your completed orders",
  yourCompletedOrdersDescription: "Review past sales from your own cashier account, correct an email address, and resend a receipt when needed.",
  order: "Order",
  orderDetails: "Order details",
  saleInfo: "Sale info",
  status: "Status",
  paymentNote: "Payment note",
  lineItems: "Line items",
  qty: "Qty",
  unit: "Unit",
  updateEmail: "Update email",
  saveEmail: "Save email",
  saving: "Saving...",
  cancel: "Cancel",
  customerEmailUpdated: "Customer email updated.",
  unableToUpdateCustomerEmail: "Unable to update customer email.",
  unableToResendReceipt: "Unable to resend receipt.",
  receiptResentTo: "Receipt resent to",
  noOrdersFound: "No orders found yet.",
  walkInCustomer: "Walk-in customer",
  noEmailProvided: "No email provided",
  noPhoneProvided: "No phone provided",
  receiptAndTotals: "Receipt and totals",
  receipt: "Receipt",
  recipient: "Recipient",
  resendReceipt: "Resend receipt",
  sending: "Sending...",
  noCustomerEmailOnFile: "No customer email on file",
  settingsTitle: "Selling preferences",
  settingsDescription: "Set your country and language once so taxes, currency, and receipt behavior stay consistent during sales.",
  profileContext: "Profile context",
  defaultSellingContext: "Default selling context",
  defaultSellingContextDescription: "These settings drive tax calculation, currency display, and localized receipt behavior each time you sell.",
  preferences: "Preferences",
  cashierSettings: "cashier settings",
  saveSettings: "Save settings",
  preferencesSaved: "Preferences saved.",
  unableToSavePreferences: "Unable to save preferences.",
  firstTimeSetup: "First-time setup",
  setSellingPreferences: "Set your selling preferences",
  setupDescription: "These preferences drive taxes, language, currency, and receipt behavior. You only need to set them once.",
  appliedAutomatically: "Applied automatically",
  appliedTaxes: "Country-specific tax rules",
  appliedCurrency: "Currency and legal labels",
  appliedTemplates: "Localized receipt templates",
  appliedLanguage: "Default app language",
  savePreferences: "Save preferences",
  loginEyebrow: "Staff Access",
  authBrandSubtitle: "Sample Sales",
  loginHeroTitle: "Fast checkout, clean controls, no SharePoint dependency.",
  loginHeroDescription: "Start with local authentication, then add Microsoft Entra ID as a second provider without redesigning the app.",
  demoCredentials: "Demo credentials",
  signInTitle: "Sign in to start selling",
  emailLabel: "Email address",
  passwordLabel: "Password",
  forgotPassword: "Forgot password?",
  signIn: "Continue",
  signingIn: "Signing in...",
  unableToSignIn: "Unable to sign in.",
  ssoRolloutPath: "SSO rollout path: add Entra ID on the auth provider layer while keeping the same roles and user records.",
  openDemoCatalog: "Open demo catalog",
  invalidCredentials: "Email or password is incorrect.",
  demoAccessCta: "Use demo credentials",
  needLocalAccount: "Need a local account?",
  registerAccountCta: "Register",
  registerHeroTitle: "Create your staff account",
  registerHeroDescription: "Register a real local-auth account, then set your country and language preferences after your first sign-in.",
  localAccountAccess: "Local account access",
  localAccountRoleNote: "Staff users start with the `STAFF` role.",
  localAccountAdminNote: "Admins can promote, disable, or reset users from the app.",
  registerEyebrow: "Register",
  registerTitle: "Create an account",
  firstNameLabel: "First name",
  lastNameLabel: "Last name",
  confirmPasswordLabel: "Confirm password",
  createAccount: "Create account",
  creatingAccount: "Creating account...",
  alreadyHaveAccount: "Already have an account?",
  forgotPasswordEyebrow: "Password reset",
  forgotPasswordTitle: "Reset your password",
  forgotPasswordDescription:
    "Enter your account email address. If it exists, the app will send a one-time reset link that expires in 60 minutes.",
  sendResetLink: "Send reset link",
  sendingResetLink: "Sending reset link...",
  unableToSendResetInstructions: "Unable to send reset instructions.",
  resetLinkSent: "If an account exists for that email, a reset link has been sent.",
  rememberedPassword: "Remembered your password?",
  backToLogin: "Back to login",
  resetPasswordEyebrow: "Password reset",
  resetPasswordTitle: "Choose a new password",
  resetPasswordDescription: "Use a strong password with at least 12 characters, including uppercase, lowercase, number, and symbol.",
  resetLinkIncomplete: "This reset link is incomplete. Request a new one from the forgot password page.",
  newPasswordLabel: "New password",
  newPasswordPlaceholder: "Enter a strong password",
  confirmPasswordPlaceholder: "Re-enter the password",
  updatePassword: "Update password",
  updatingPassword: "Updating password...",
  unableToResetPassword: "Unable to reset password.",
  passwordUpdatedRedirecting: "Password updated. Redirecting to login...",
  needAnotherResetLink: "Need another reset link?",
  requestNewResetLink: "Request a new one",
  adminEyebrow: "Admin",
  adminTitle: "Control plane for catalog, configuration, and auditability.",
  adminDescription: "Manage products, order support, taxes, and receipt content from one consistent operations surface.",
  ordersToday: "Orders Today",
  receiptSuccess: "Receipt Success",
  activeProducts: "Active Products",
  countriesLabel: "Countries",
  catalogManagement: "Catalog management",
  catalogManagementDetail: "Products, pricing, tax category, country availability",
  orderHistory: "Order history",
  orderHistoryDetail: "Recent sales, line-item detail, resend receipt",
  emailTemplatesTitle: "Email templates",
  emailTemplatesDetail: "Localized receipt subject and body content",
  countrySettingsTitle: "Country and app settings",
  countrySettingsDetail: "Taxes, labels, currency, checkout behavior",
  catalogEyebrow: "Catalog",
  manageSellableInventory: "Manage sellable inventory",
  manageSellableInventoryDescription: "Control SKU details, base pricing, tax categories, and country availability from one editor.",
  addProduct: "Add product",
  ordersEyebrow: "Orders",
  allOrdersTitle: "All orders across staff and events",
  allOrdersDescription: "Support the sales floor with receipt resends, cashier visibility, and full line-item order review.",
  exportCsv: "Export CSV",
  recentOrderHistory: "Recent order history",
  configurationEyebrow: "Configuration",
  configurationTitle: "Country, tax, and legal settings",
  configurationDescription: "Define the country-level rules that drive pricing, receipt language, legal content, and tax calculation.",
  emailTemplatesEyebrow: "Email templates",
  localizedReceiptContent: "Localized receipt content",
  localizedReceiptContentDescription: "Maintain customer-facing receipt copy by country and language with a consistent editor and preview.",
  orderSupport: "Order support",
  sent: "Sent",
  resent: "Resent",
  notYet: "Not yet",
  never: "Never",
  cashier: "Cashier",
  country: "Country",
  payment: "Payment",
  noCountriesFound: "No countries found.",
  selectedCountry: "Selected country",
  countrySettingsSaved: "Country settings saved.",
  unableToSaveCountrySettings: "Unable to save country settings.",
  countryConfiguration: "Country configuration",
  countriesTitle: "Countries",
  saveChanges: "Save changes",
  countryName: "Country name",
  companyNameLabel: "Company name",
  currency: "Currency",
  defaultLocaleLabel: "Default locale",
  defaultLanguageLabel: "Default language",
  pricesIncludeTax: "Prices include tax",
  countryActive: "Country active",
  legalLabel: "Legal label",
  receiptFooter: "Receipt footer",
  taxesEyebrow: "Taxes",
  taxRulesTitle: "Tax rules",
  addRule: "Add rule",
  createRule: "Create rule",
  editRule: "Edit rule",
  category: "Category",
  codeLabel: "Code",
  nameLabel: "Name",
  ratePercent: "Rate percent",
  effectiveFrom: "Effective from",
  effectiveTo: "Effective to",
  compoundRule: "Compound rule",
  ruleActive: "Rule active",
  saveRule: "Save rule",
  taxRuleSaved: "Tax rule saved.",
  unableToSaveTaxRule: "Unable to save tax rule.",
  noTaxRuleSelected: "No tax rule selected.",
  unableToSaveCatalogItem: "Unable to save catalog item.",
  noCatalogItemsFound: "No catalog items found.",
  descriptionLabel: "Description",
  basePriceLabel: "Base price",
  taxCategoryLabel: "Tax category",
  statusLabel: "Status",
  activeLabel: "Active",
  archivedLabel: "Archived",
  marketsLabel: "Markets",
  actionsLabel: "Actions",
  editCatalogItem: "Edit catalog item",
  productAvailabilityDescription: "Enable a market, then optionally set a local price override.",
  activeInCatalog: "Active in catalog",
  inactiveInCatalog: "Inactive in catalog",
  overridePriceLabel: "Override price",
  productActiveSellable: "Product is active and sellable",
  customerAndOrder: "Customer and order",
  totalsAndMarketContext: "Totals and market context",
  receiptBlocks: "Receipt blocks",
  unableToSaveTemplate: "Unable to save template.",
  unableToCreateTemplate: "Unable to create template.",
  templateSaved: "Template saved.",
  templateCreated: "Template created.",
  noTemplatesFound: "No templates found.",
  templates: "Templates",
  receiptTemplateEditor: "Receipt template editor",
  receiptTemplateEditorDescription: "Build a structured receipt email with editable copy, live preview, and country-specific legal content.",
  currentTemplate: "Current template",
  activeTemplate: "Active template",
  inactiveTemplate: "Inactive template",
  templateBody: "Template body",
  saveTemplate: "Save template",
  resetToRecommendedLayout: "Reset to recommended layout",
  visualEditor: "Visual editor",
  htmlSource: "HTML source",
  htmlModeHint: "Edit the actual email markup, including rows, sections, and table structure. This is the recommended mode for structured receipts.",
  visualModeHint: "Use the visual editor only for light copy edits. Structured receipt layouts are safest in HTML source mode.",
  livePreview: "Live preview",
  livePreviewDescription: "Country footer, legal copy, and order item rows are rendered here using sample data and the current template structure.",
  createTemplateTitle: "Create template",
  newReceiptTemplate: "New receipt template",
  newTemplateDescription: "New templates start from the recommended receipt structure and automatically pick up the selected country footer and legal copy.",
  templateName: "Template name",
  emailSubject: "Email subject",
  starterLayout: "Starter layout",
  starterLayoutDescription: "This base layout includes order details, item rows, totals, and country-specific footer/legal placeholders.",
  creating: "Creating...",
  theme: "Theme",
  lightMode: "Light mode",
  darkMode: "Dark mode"
};

const fr: StaffCopy = {
  navSell: "Vente",
  navOrders: "Commandes",
  navAdmin: "Admin",
  settings: "Parametres",
  logout: "Deconnexion",
  guest: "Invite",
  login: "Connexion",
  openNavigation: "Ouvrir la navigation",
  closeNavigation: "Fermer la navigation",
  searchPlaceholder: "Rechercher un produit ou SKU",
  regionLanguage: "Region",
  regionLabel: "Province / etat",
  languageLabel: "Langue",
  loadSellingContextError: "Impossible de charger le contexte de vente.",
  loadCatalog: "Chargement du catalogue...",
  saleCompleted: "Vente terminee",
  orderSavedReceiptQueued: "La commande a ete enregistree. Le recu sera envoye si une adresse courriel a ete fournie.",
  currentCart: "Panier en cours",
  itemSingular: "article",
  itemPlural: "articles",
  total: "Total",
  checkout: "Paiement",
  reviewCart: "Verifier le panier",
  readyToCheckout: "Pret pour le paiement",
  close: "Fermer",
  currentSale: "Vente en cours",
  cart: "Panier",
  addItemsToStartSale: "Ajoutez des articles pour commencer une vente.",
  each: "chaque",
  proceedToCheckout: "Passer au paiement",
  customer: "Client",
  completeSale: "Completer la vente",
  customerNamePlaceholder: "Nom du client",
  emailAddressPlaceholder: "Adresse courriel",
  phoneOptionalPlaceholder: "Telephone (optionnel)",
  cartIsEmpty: "Le panier est vide.",
  customerNameEmailRequired: "Le nom et le courriel du client sont obligatoires.",
  confirmPaymentFirst: "Confirmez le paiement sur le terminal externe avant de completer la vente.",
  unableToCompleteSale: "Impossible de completer la vente.",
  paymentReceived: "Paiement confirme",
  awaitingPinpad: "Paiement en attente sur le terminal externe",
  pinpadHint: "Utilisez ceci seulement lorsque la transaction du terminal est approuvee devant le client.",
  markPaymentReceived: "Confirmer le paiement",
  reset: "Reinitialiser",
  confirmCheckout: "Confirmer la vente",
  submitting: "Envoi...",
  backToCart: "Retour au panier",
  clearCart: "Vider le panier",
  orderSummary: "Resume de la commande",
  recentSales: "Ventes recentes",
  subtotal: "Sous-total",
  tax: "Taxe",
  yourCompletedOrders: "Vos commandes completees",
  yourCompletedOrdersDescription: "Consultez vos ventes passees, corrigez une adresse courriel et renvoyez un recu au besoin.",
  order: "Commande",
  orderDetails: "Details de la commande",
  saleInfo: "Infos de vente",
  status: "Statut",
  paymentNote: "Note de paiement",
  lineItems: "Articles",
  qty: "Qté",
  unit: "Unite",
  updateEmail: "Modifier le courriel",
  saveEmail: "Enregistrer le courriel",
  saving: "Enregistrement...",
  cancel: "Annuler",
  customerEmailUpdated: "Le courriel du client a ete mis a jour.",
  unableToUpdateCustomerEmail: "Impossible de mettre a jour le courriel du client.",
  unableToResendReceipt: "Impossible de renvoyer le recu.",
  receiptResentTo: "Recu renvoye a",
  noOrdersFound: "Aucune commande trouvee pour le moment.",
  walkInCustomer: "Client sans dossier",
  noEmailProvided: "Aucun courriel fourni",
  noPhoneProvided: "Aucun telephone fourni",
  receiptAndTotals: "Recu et totaux",
  receipt: "Recu",
  recipient: "Destinataire",
  resendReceipt: "Renvoyer le recu",
  sending: "Envoi...",
  noCustomerEmailOnFile: "Aucun courriel client au dossier",
  settingsTitle: "Preferences de vente",
  settingsDescription: "Definissez votre pays, region et langue une seule fois afin que les taxes, la devise et les recus restent coherents pendant les ventes.",
  profileContext: "Contexte utilisateur",
  defaultSellingContext: "Contexte de vente par defaut",
  defaultSellingContextDescription: "Ces parametres controlent les taxes, la devise et le comportement localise des recus a chaque vente.",
  preferences: "Preferences",
  cashierSettings: "parametres caissier",
  saveSettings: "Enregistrer les parametres",
  preferencesSaved: "Preferences enregistrees.",
  unableToSavePreferences: "Impossible d'enregistrer les preferences.",
  firstTimeSetup: "Configuration initiale",
  setSellingPreferences: "Definissez vos preferences de vente",
  setupDescription: "Ces preferences determinent les taxes, la langue, la devise et le comportement des recus. Vous n'avez a les definir qu'une seule fois.",
  appliedAutomatically: "Applique automatiquement",
  appliedTaxes: "Regles de taxes par pays et region",
  appliedCurrency: "Devise et libelles legaux",
  appliedTemplates: "Modeles de recu localises",
  appliedLanguage: "Langue par defaut de l'application",
  savePreferences: "Enregistrer les preferences",
  loginEyebrow: "Acces employe",
  authBrandSubtitle: "Vente d'echantillons",
  loginHeroTitle: "Paiement rapide, controles clairs, sans dependance a SharePoint.",
  loginHeroDescription: "Commencez avec une authentification locale, puis ajoutez Microsoft Entra ID sans refaire l'application.",
  demoCredentials: "Identifiants de demonstration",
  signInTitle: "Connectez-vous pour commencer a vendre",
  emailLabel: "Adresse courriel",
  passwordLabel: "Mot de passe",
  forgotPassword: "Mot de passe oublie ?",
  signIn: "Continuer",
  signingIn: "Connexion...",
  unableToSignIn: "Impossible de se connecter.",
  ssoRolloutPath: "Parcours SSO : ajoutez Entra ID dans la couche fournisseur d'authentification tout en conservant les memes roles et dossiers utilisateurs.",
  openDemoCatalog: "Ouvrir le catalogue demo",
  invalidCredentials: "Le courriel ou le mot de passe est incorrect.",
  demoAccessCta: "Utiliser les identifiants demo",
  needLocalAccount: "Besoin d'un compte local ?",
  registerAccountCta: "S'inscrire",
  registerHeroTitle: "Creez votre compte employe",
  registerHeroDescription: "Inscrivez un vrai compte local, puis definissez votre pays et vos preferences linguistiques apres votre premiere connexion.",
  localAccountAccess: "Acces au compte local",
  localAccountRoleNote: "Les employes commencent avec le role `STAFF`.",
  localAccountAdminNote: "Les administrateurs peuvent promouvoir, desactiver ou reinitialiser les utilisateurs depuis l'application.",
  registerEyebrow: "Inscription",
  registerTitle: "Creer un compte",
  firstNameLabel: "Prenom",
  lastNameLabel: "Nom",
  confirmPasswordLabel: "Confirmer le mot de passe",
  createAccount: "Creer un compte",
  creatingAccount: "Creation du compte...",
  alreadyHaveAccount: "Vous avez deja un compte ?",
  forgotPasswordEyebrow: "Reinitialisation du mot de passe",
  forgotPasswordTitle: "Reinitialisez votre mot de passe",
  forgotPasswordDescription:
    "Entrez l'adresse courriel de votre compte. Si elle existe, l'application enverra un lien unique de reinitialisation valable 60 minutes.",
  sendResetLink: "Envoyer le lien de reinitialisation",
  sendingResetLink: "Envoi du lien de reinitialisation...",
  unableToSendResetInstructions: "Impossible d'envoyer les instructions de reinitialisation.",
  resetLinkSent: "Si un compte existe pour cette adresse, un lien de reinitialisation a ete envoye.",
  rememberedPassword: "Vous vous souvenez de votre mot de passe ?",
  backToLogin: "Retour a la connexion",
  resetPasswordEyebrow: "Reinitialisation du mot de passe",
  resetPasswordTitle: "Choisissez un nouveau mot de passe",
  resetPasswordDescription:
    "Utilisez un mot de passe fort d'au moins 12 caracteres avec majuscule, minuscule, chiffre et symbole.",
  resetLinkIncomplete: "Ce lien de reinitialisation est incomplet. Demandez-en un nouveau depuis la page mot de passe oublie.",
  newPasswordLabel: "Nouveau mot de passe",
  newPasswordPlaceholder: "Entrez un mot de passe fort",
  confirmPasswordPlaceholder: "Saisissez de nouveau le mot de passe",
  updatePassword: "Mettre a jour le mot de passe",
  updatingPassword: "Mise a jour du mot de passe...",
  unableToResetPassword: "Impossible de reinitialiser le mot de passe.",
  passwordUpdatedRedirecting: "Mot de passe mis a jour. Redirection vers la connexion...",
  needAnotherResetLink: "Besoin d'un autre lien de reinitialisation ?",
  requestNewResetLink: "En demander un nouveau",
  adminEyebrow: "Admin",
  adminTitle: "Surface de controle pour le catalogue, la configuration et la tracabilite.",
  adminDescription: "Gerez les produits, le soutien aux commandes, les taxes et le contenu des recus dans une surface d'exploitation coherente.",
  ordersToday: "Commandes du jour",
  receiptSuccess: "Succes des recus",
  activeProducts: "Produits actifs",
  countriesLabel: "Pays",
  catalogManagement: "Gestion du catalogue",
  catalogManagementDetail: "Produits, prix, categorie de taxe et disponibilite par pays",
  orderHistory: "Historique des commandes",
  orderHistoryDetail: "Ventes recentes, details par article et renvoi de recu",
  emailTemplatesTitle: "Modeles de courriel",
  emailTemplatesDetail: "Objet et contenu du recu localises",
  countrySettingsTitle: "Parametres pays et application",
  countrySettingsDetail: "Taxes, libelles, devise et comportement de paiement",
  catalogEyebrow: "Catalogue",
  manageSellableInventory: "Gerer l'inventaire vendable",
  manageSellableInventoryDescription: "Controlez les details SKU, le prix de base, les categories de taxe et la disponibilite par pays dans un seul editeur.",
  addProduct: "Ajouter un produit",
  ordersEyebrow: "Commandes",
  allOrdersTitle: "Toutes les commandes par employe et evenement",
  allOrdersDescription: "Soutenez l'equipe de vente avec les renvois de recu, la visibilite caissier et l'examen complet des articles.",
  exportCsv: "Exporter CSV",
  recentOrderHistory: "Historique recent des commandes",
  configurationEyebrow: "Configuration",
  configurationTitle: "Parametres de pays, taxes et mentions legales",
  configurationDescription: "Definissez les regles par pays qui controlent les prix, la langue des recus, le contenu legal et le calcul des taxes.",
  emailTemplatesEyebrow: "Modeles de courriel",
  localizedReceiptContent: "Contenu de recu localise",
  localizedReceiptContentDescription: "Maintenez le contenu du recu client par pays et langue avec un editeur et un apercu coherents.",
  orderSupport: "Soutien des commandes",
  sent: "Envoye",
  resent: "Renvoye",
  notYet: "Pas encore",
  never: "Jamais",
  cashier: "Caissier",
  country: "Pays",
  payment: "Paiement",
  noCountriesFound: "Aucun pays trouve.",
  selectedCountry: "Pays selectionne",
  countrySettingsSaved: "Parametres du pays enregistres.",
  unableToSaveCountrySettings: "Impossible d'enregistrer les parametres du pays.",
  countryConfiguration: "Configuration du pays",
  countriesTitle: "Pays",
  saveChanges: "Enregistrer les changements",
  countryName: "Nom du pays",
  companyNameLabel: "Nom de l'entreprise",
  currency: "Devise",
  defaultLocaleLabel: "Parametre regional par defaut",
  defaultLanguageLabel: "Langue par defaut",
  pricesIncludeTax: "Les prix incluent les taxes",
  countryActive: "Pays actif",
  legalLabel: "Libelle legal",
  receiptFooter: "Pied de recu",
  taxesEyebrow: "Taxes",
  taxRulesTitle: "Regles de taxe",
  addRule: "Ajouter une regle",
  createRule: "Creer une regle",
  editRule: "Modifier la regle",
  category: "Categorie",
  codeLabel: "Code",
  nameLabel: "Nom",
  ratePercent: "Taux en pourcentage",
  effectiveFrom: "En vigueur a partir de",
  effectiveTo: "En vigueur jusqu'a",
  compoundRule: "Regle composee",
  ruleActive: "Regle active",
  saveRule: "Enregistrer la regle",
  taxRuleSaved: "Regle de taxe enregistree.",
  unableToSaveTaxRule: "Impossible d'enregistrer la regle de taxe.",
  noTaxRuleSelected: "Aucune regle de taxe selectionnee.",
  unableToSaveCatalogItem: "Impossible d'enregistrer l'article du catalogue.",
  noCatalogItemsFound: "Aucun article de catalogue trouve.",
  descriptionLabel: "Description",
  basePriceLabel: "Prix de base",
  taxCategoryLabel: "Categorie de taxe",
  statusLabel: "Statut",
  activeLabel: "Actif",
  archivedLabel: "Archive",
  marketsLabel: "Marches",
  actionsLabel: "Actions",
  editCatalogItem: "Modifier l'article du catalogue",
  productAvailabilityDescription: "Activez un marche, puis ajoutez au besoin un prix local remplace.",
  activeInCatalog: "Actif dans le catalogue",
  inactiveInCatalog: "Inactif dans le catalogue",
  overridePriceLabel: "Prix remplace",
  productActiveSellable: "Le produit est actif et vendable",
  customerAndOrder: "Client et commande",
  totalsAndMarketContext: "Totaux et contexte du marche",
  receiptBlocks: "Blocs du recu",
  unableToSaveTemplate: "Impossible d'enregistrer le modele.",
  unableToCreateTemplate: "Impossible de creer le modele.",
  templateSaved: "Modele enregistre.",
  templateCreated: "Modele cree.",
  noTemplatesFound: "Aucun modele trouve.",
  templates: "Modeles",
  receiptTemplateEditor: "Editeur de modele de recu",
  receiptTemplateEditorDescription: "Construisez un courriel de recu structure avec texte modifiable, apercu en direct et contenu legal par pays.",
  currentTemplate: "Modele actuel",
  activeTemplate: "Modele actif",
  inactiveTemplate: "Modele inactif",
  templateBody: "Corps du modele",
  saveTemplate: "Enregistrer le modele",
  resetToRecommendedLayout: "Reinitialiser la mise en page recommandee",
  visualEditor: "Editeur visuel",
  htmlSource: "Source HTML",
  htmlModeHint: "Modifiez le balisage du courriel, y compris les lignes, sections et tableaux. C'est le mode recommande pour les recus structures.",
  visualModeHint: "Utilisez l'editeur visuel seulement pour de legeres retouches de texte. Les recus structures sont plus fiables en mode source HTML.",
  livePreview: "Apercu en direct",
  livePreviewDescription: "Le pied de page, le contenu legal et les lignes d'articles sont rendus ici avec des donnees d'exemple et la structure actuelle du modele.",
  createTemplateTitle: "Creer un modele",
  newReceiptTemplate: "Nouveau modele de recu",
  newTemplateDescription: "Les nouveaux modeles commencent avec la structure de recu recommandee et recuperent automatiquement le pied de page et le contenu legal du pays choisi.",
  templateName: "Nom du modele",
  emailSubject: "Objet du courriel",
  starterLayout: "Mise en page initiale",
  starterLayoutDescription: "Cette structure de base inclut les details de commande, les lignes d'articles, les totaux et les espaces reserves de pied de page et contenu legal.",
  creating: "Creation...",
  theme: "Theme",
  lightMode: "Mode clair",
  darkMode: "Mode sombre"
};

export function normalizeStaffLocale(language?: string | null): StaffLocale {
  return language?.toLowerCase().startsWith("fr") ? "fr-CA" : "en";
}

export function getStaffCopy(language?: string | null) {
  return normalizeStaffLocale(language) === "fr-CA" ? fr : en;
}

export function resolveStaffLocaleFromHeader(header?: string | null): StaffLocale {
  const primaryLanguage = header?.split(",")[0]?.trim();
  return normalizeStaffLocale(primaryLanguage);
}
