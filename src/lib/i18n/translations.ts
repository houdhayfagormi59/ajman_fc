export type Locale = 'en' | 'fr' | 'ar';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard', players: 'Players', teams: 'Teams', injuries: 'Injuries',
    performance: 'Performance', training: 'Training', principles: 'Principles',
    video: 'Video Analysis', ai_analyzer: 'AI Analyzer', reports: 'Reports',
    scouting: 'Scouting', admin: 'Admin Panel', team_profile: 'Team Profile',
    match_analysis: 'Match Analysis', player_analytics: 'Player Analytics',
    welcome: 'Welcome', sign_out: 'Sign out', dark_mode: 'Dark mode', light_mode: 'Light mode',
    add_player: 'Add Player', add_team: 'Add Team', create: 'Create', save: 'Save', cancel: 'Cancel', delete: 'Delete',
    name: 'Name', position: 'Position', age_group: 'Age Group', status: 'Status',
    goals: 'Goals', assists: 'Assists', rating: 'Rating', matches: 'Matches',
    fit: 'Fit', injured: 'Injured', recovering: 'Recovering', inactive: 'Inactive',
    offensive: 'Offensive', defensive: 'Defensive', transition: 'Transition', set_piece: 'Set Pieces',
    strengths: 'Strengths', weaknesses: 'Weaknesses', recommendations: 'Recommendations',
    overall_score: 'Overall Score', form_trend: 'Form Trend', potential: 'Potential',
    pass_accuracy: 'Pass Accuracy', shot_accuracy: 'Shot Accuracy', tackles_per_match: 'Tackles/Match',
    goals_per_match: 'Goals/Match', minutes_played: 'Minutes Played', availability: 'Availability',
    events_detected: 'Events Detected', confidence: 'Confidence', analyze: 'Analyze',
    export_pdf: 'Export PDF', no_data: 'No data available',
  },
  fr: {
    dashboard: 'Tableau de bord', players: 'Joueurs', teams: 'Équipes', injuries: 'Blessures',
    performance: 'Performance', training: 'Entraînement', principles: 'Principes',
    video: 'Analyse vidéo', ai_analyzer: 'Analyseur IA', reports: 'Rapports',
    scouting: 'Recrutement', admin: 'Panneau Admin', team_profile: 'Profil Équipe',
    match_analysis: 'Analyse de match', player_analytics: 'Analytique Joueur',
    welcome: 'Bienvenue', sign_out: 'Déconnexion', dark_mode: 'Mode sombre', light_mode: 'Mode clair',
    add_player: 'Ajouter joueur', add_team: 'Ajouter équipe', create: 'Créer', save: 'Sauvegarder', cancel: 'Annuler', delete: 'Supprimer',
    name: 'Nom', position: 'Poste', age_group: 'Catégorie', status: 'Statut',
    goals: 'Buts', assists: 'Passes décisives', rating: 'Note', matches: 'Matchs',
    fit: 'Apte', injured: 'Blessé', recovering: 'En récupération', inactive: 'Inactif',
    offensive: 'Offensif', defensive: 'Défensif', transition: 'Transition', set_piece: 'Coups de pied arrêtés',
    strengths: 'Points forts', weaknesses: 'Points faibles', recommendations: 'Recommandations',
    overall_score: 'Score global', form_trend: 'Tendance de forme', potential: 'Potentiel',
    pass_accuracy: 'Précision de passe', shot_accuracy: 'Précision de tir', tackles_per_match: 'Tacles/match',
    goals_per_match: 'Buts/match', minutes_played: 'Minutes jouées', availability: 'Disponibilité',
    events_detected: 'Événements détectés', confidence: 'Confiance', analyze: 'Analyser',
    export_pdf: 'Exporter PDF', no_data: 'Aucune donnée disponible',
  },
  ar: {
    dashboard: 'لوحة التحكم', players: 'اللاعبون', teams: 'الفرق', injuries: 'الإصابات',
    performance: 'الأداء', training: 'التدريب', principles: 'المبادئ',
    video: 'تحليل الفيديو', ai_analyzer: 'محلل الذكاء الاصطناعي', reports: 'التقارير',
    scouting: 'الاستكشاف', admin: 'لوحة الإدارة', team_profile: 'ملف الفريق',
    match_analysis: 'تحليل المباراة', player_analytics: 'تحليلات اللاعب',
    welcome: 'مرحباً', sign_out: 'تسجيل الخروج', dark_mode: 'الوضع الداكن', light_mode: 'الوضع الفاتح',
    add_player: 'إضافة لاعب', add_team: 'إضافة فريق', create: 'إنشاء', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف',
    name: 'الاسم', position: 'المركز', age_group: 'الفئة العمرية', status: 'الحالة',
    goals: 'الأهداف', assists: 'التمريرات الحاسمة', rating: 'التقييم', matches: 'المباريات',
    fit: 'جاهز', injured: 'مصاب', recovering: 'يتعافى', inactive: 'غير نشط',
    offensive: 'هجومي', defensive: 'دفاعي', transition: 'انتقال', set_piece: 'الكرات الثابتة',
    strengths: 'نقاط القوة', weaknesses: 'نقاط الضعف', recommendations: 'التوصيات',
    overall_score: 'النتيجة الإجمالية', form_trend: 'اتجاه الأداء', potential: 'الإمكانيات',
    pass_accuracy: 'دقة التمرير', shot_accuracy: 'دقة التسديد', tackles_per_match: 'التدخلات/مباراة',
    goals_per_match: 'الأهداف/مباراة', minutes_played: 'الدقائق', availability: 'التوفر',
    events_detected: 'الأحداث المكتشفة', confidence: 'الثقة', analyze: 'تحليل',
    export_pdf: 'تصدير PDF', no_data: 'لا توجد بيانات',
  },
};

export function t(key: string, locale: Locale = 'en'): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}

export default translations;
