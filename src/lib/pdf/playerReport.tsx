import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Player, Injury, Performance, Evaluation } from '@/lib/types';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica', color: '#0f172a' },
  header: { marginBottom: 20, borderBottomWidth: 3, borderBottomColor: '#EA580C', paddingBottom: 14 },
  brandBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  brandLogo: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EA580C', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  brandLogoText: { color: '#FFFFFF', fontSize: 18, fontWeight: 700 },
  brandName: { fontSize: 16, fontWeight: 700, color: '#9A3412' },
  brandSub: { fontSize: 9, color: '#C2410C', fontWeight: 600 },
  title: { fontSize: 24, fontWeight: 700, color: '#9A3412' },
  subtitle: { fontSize: 11, color: '#64748b', marginTop: 4 },
  h2: { fontSize: 13, fontWeight: 700, color: '#9A3412', marginTop: 18, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#FED7AA', paddingBottom: 3 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 110, color: '#64748b', fontSize: 9 },
  value: { flex: 1, fontSize: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  col: { flex: 1, minWidth: '45%' },
  table: { width: '100%', marginTop: 6 },
  thead: { flexDirection: 'row', backgroundColor: '#FFEDD5', paddingVertical: 5, paddingHorizontal: 6 },
  th: { fontSize: 9, fontWeight: 700, color: '#9A3412' },
  tr: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: '#FFEDD5' },
  td: { fontSize: 9, color: '#334155' },
  section: { marginTop: 10, padding: 10, backgroundColor: '#FFF7ED', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#F97316' },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: '#9A3412', marginBottom: 4 },
  footer: { position: 'absolute', bottom: 20, left: 36, right: 36, fontSize: 8, color: '#94a3b8', textAlign: 'center', borderTopWidth: 0.5, borderTopColor: '#FED7AA', paddingTop: 6 },
  statBox: { backgroundColor: '#FFF7ED', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#FED7AA' },
  statLabel: { fontSize: 8, color: '#C2410C', textTransform: 'uppercase', fontWeight: 700 },
  statValue: { fontSize: 18, fontWeight: 700, color: '#9A3412', marginTop: 2 },
});

function ageFromDOB(dob: string): number {
  const b = new Date(dob), n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return a;
}

export function PlayerReport({
  player, injuries, performances, evaluation, coachName, generatedAt,
}: {
  player: Player;
  injuries: Injury[];
  performances: Performance[];
  evaluation: Evaluation | null;
  coachName: string;
  generatedAt: string;
}) {
  const totalGoals = performances.reduce((s, p) => s + (p.goals ?? 0), 0);
  const totalAssists = performances.reduce((s, p) => s + (p.assists ?? 0), 0);
  const totalPasses = performances.reduce((s, p) => s + (p.passes_completed ?? 0), 0);
  const totalAttempts = performances.reduce((s, p) => s + (p.passes_attempted ?? 0), 0);
  const ratings = performances.map((p) => p.rating).filter((r): r is number => r !== null);
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(2) : '—';
  const passAcc = totalAttempts ? Math.round((totalPasses / totalAttempts) * 100) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandBar}>
            <View style={styles.brandLogo}><Text style={styles.brandLogoText}>A</Text></View>
            <View>
              <Text style={styles.brandName}>AJMAN COACH</Text>
              <Text style={styles.brandSub}>PLAYER MANAGEMENT · UAE</Text>
            </View>
          </View>
          <Text style={styles.title}>Player Report</Text>
          <Text style={styles.subtitle}>
            {player.first_name} {player.last_name} · {player.position} · {player.age_group || 'N/A'}
          </Text>
          <Text style={styles.subtitle}>Prepared by {coachName} · {generatedAt}</Text>
        </View>

        <Text style={styles.h2}>1. Player Information</Text>
        <View style={styles.grid}>
          <View style={styles.col}>
            <View style={styles.row}><Text style={styles.label}>Full name</Text><Text style={styles.value}>{player.first_name} {player.last_name}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Date of birth</Text><Text style={styles.value}>{player.date_of_birth}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Age</Text><Text style={styles.value}>{ageFromDOB(player.date_of_birth)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Nationality</Text><Text style={styles.value}>{player.nationality || '—'}</Text></View>
          </View>
          <View style={styles.col}>
            <View style={styles.row}><Text style={styles.label}>Position</Text><Text style={styles.value}>{player.position}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Team</Text><Text style={styles.value}>{player.age_group || 'N/A'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Jersey</Text><Text style={styles.value}>{player.jersey_number ?? '—'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Status</Text><Text style={styles.value}>{player.status.toUpperCase()}</Text></View>
          </View>
          <View style={styles.col}>
            <View style={styles.row}><Text style={styles.label}>Height</Text><Text style={styles.value}>{player.height_cm ? `${player.height_cm} cm` : '—'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Weight</Text><Text style={styles.value}>{player.weight_kg ? `${player.weight_kg} kg` : '—'}</Text></View>
          </View>
        </View>

        <Text style={styles.h2}>2. Match Performance Summary</Text>
        <View style={[styles.grid, { marginBottom: 8 }]}>
          <View style={[styles.col, styles.statBox]}><Text style={styles.statLabel}>Matches</Text><Text style={styles.statValue}>{performances.length}</Text></View>
          <View style={[styles.col, styles.statBox]}><Text style={styles.statLabel}>Goals</Text><Text style={styles.statValue}>{totalGoals}</Text></View>
          <View style={[styles.col, styles.statBox]}><Text style={styles.statLabel}>Assists</Text><Text style={styles.statValue}>{totalAssists}</Text></View>
          <View style={[styles.col, styles.statBox]}><Text style={styles.statLabel}>Avg rating</Text><Text style={styles.statValue}>{avgRating}</Text></View>
          <View style={[styles.col, styles.statBox]}><Text style={styles.statLabel}>Pass %</Text><Text style={styles.statValue}>{passAcc}%</Text></View>
        </View>

        {performances.length > 0 && (
          <>
            <Text style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: '#9A3412' }}>Last matches</Text>
            <View style={styles.table}>
              <View style={styles.thead}>
                <Text style={[styles.th, { width: '18%' }]}>Date</Text>
                <Text style={[styles.th, { width: '32%' }]}>Opponent</Text>
                <Text style={[styles.th, { width: '10%' }]}>Min</Text>
                <Text style={[styles.th, { width: '8%' }]}>G</Text>
                <Text style={[styles.th, { width: '8%' }]}>A</Text>
                <Text style={[styles.th, { width: '12%' }]}>Passes</Text>
                <Text style={[styles.th, { width: '12%' }]}>Rating</Text>
              </View>
              {performances.slice(0, 10).map((p) => (
                <View key={p.id} style={styles.tr}>
                  <Text style={[styles.td, { width: '18%' }]}>{p.match_date}</Text>
                  <Text style={[styles.td, { width: '32%' }]}>{p.opponent}</Text>
                  <Text style={[styles.td, { width: '10%' }]}>{p.minutes_played}</Text>
                  <Text style={[styles.td, { width: '8%' }]}>{p.goals}</Text>
                  <Text style={[styles.td, { width: '8%' }]}>{p.assists}</Text>
                  <Text style={[styles.td, { width: '12%' }]}>{p.passes_completed}/{p.passes_attempted}</Text>
                  <Text style={[styles.td, { width: '12%' }]}>{p.rating ?? '—'}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.h2}>3. Technical / Tactical / Physical / Mental Evaluation</Text>
        {evaluation ? (
          <View style={styles.grid}>
            <View style={[styles.section, { flex: 1, minWidth: '45%' }]}>
              <Text style={styles.sectionTitle}>Technical</Text>
              <EvalLine label="1st Touch" v={evaluation.tech_first_touch} />
              <EvalLine label="Passing" v={evaluation.tech_passing} />
              <EvalLine label="Shooting" v={evaluation.tech_shooting} />
              <EvalLine label="Dribbling" v={evaluation.tech_dribbling} />
            </View>
            <View style={[styles.section, { flex: 1, minWidth: '45%' }]}>
              <Text style={styles.sectionTitle}>Tactical</Text>
              <EvalLine label="Positioning" v={evaluation.tac_positioning} />
              <EvalLine label="Decision making" v={evaluation.tac_decision_making} />
              <EvalLine label="Game reading" v={evaluation.tac_game_reading} />
            </View>
            <View style={[styles.section, { flex: 1, minWidth: '45%' }]}>
              <Text style={styles.sectionTitle}>Physical</Text>
              <EvalLine label="Speed" v={evaluation.phy_speed} />
              <EvalLine label="Strength" v={evaluation.phy_strength} />
              <EvalLine label="Endurance" v={evaluation.phy_endurance} />
            </View>
            <View style={[styles.section, { flex: 1, minWidth: '45%' }]}>
              <Text style={styles.sectionTitle}>Mental</Text>
              <EvalLine label="Concentration" v={evaluation.men_concentration} />
              <EvalLine label="Confidence" v={evaluation.men_confidence} />
              <EvalLine label="Teamwork" v={evaluation.men_teamwork} />
            </View>
          </View>
        ) : (
          <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>No evaluation recorded yet.</Text>
        )}

        {evaluation && (
          <>
            {evaluation.strengths && (
              <View style={styles.section}><Text style={styles.sectionTitle}>Strengths</Text><Text style={styles.td}>{evaluation.strengths}</Text></View>
            )}
            {evaluation.areas_to_improve && (
              <View style={styles.section}><Text style={styles.sectionTitle}>Areas to improve</Text><Text style={styles.td}>{evaluation.areas_to_improve}</Text></View>
            )}
            {evaluation.general_notes && (
              <View style={styles.section}><Text style={styles.sectionTitle}>General notes</Text><Text style={styles.td}>{evaluation.general_notes}</Text></View>
            )}
          </>
        )}

        <Text style={styles.h2}>4. Injury History</Text>
        {injuries.length === 0 ? (
          <Text style={{ fontSize: 10, color: '#64748b' }}>No injuries recorded.</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.thead}>
              <Text style={[styles.th, { width: '18%' }]}>Date</Text>
              <Text style={[styles.th, { width: '28%' }]}>Type</Text>
              <Text style={[styles.th, { width: '20%' }]}>Body part</Text>
              <Text style={[styles.th, { width: '14%' }]}>Severity</Text>
              <Text style={[styles.th, { width: '20%' }]}>Status</Text>
            </View>
            {injuries.map((i) => (
              <View key={i.id} style={styles.tr}>
                <Text style={[styles.td, { width: '18%' }]}>{i.injury_date}</Text>
                <Text style={[styles.td, { width: '28%' }]}>{i.injury_type}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{i.body_part}</Text>
                <Text style={[styles.td, { width: '14%' }]}>{i.severity}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{i.status}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer} fixed>
          Ajman Coach · Confidential player report · Generated {generatedAt}
        </Text>
      </Page>
    </Document>
  );
}

function EvalLine({ label, v }: { label: string; v: number | null }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
      <Text style={{ fontSize: 9, color: '#475569' }}>{label}</Text>
      <Text style={{ fontSize: 9, fontWeight: 700, color: '#9A3412' }}>{v !== null ? `${v}/10` : '—'}</Text>
    </View>
  );
}
