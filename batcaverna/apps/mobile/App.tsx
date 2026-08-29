import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { colors, NIVEIS_GAMIFICACAO } from "@batcaverna/ui";
import { formatarTempoEstudo } from "@batcaverna/utils";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "concursos" | "questoes" | "ranking">("dashboard");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B0F" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.batIcon}>🦇</Text>
          <Text style={styles.logoText}>
            Bat<Text style={styles.logoHighlight}>Caverna</Text>
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
      </View>

      {/* Main Content Scroll */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === "dashboard" && (
          <View style={styles.section}>
            {/* Boas-vindas */}
            <Text style={styles.title}>Bem-vindo à Caverna, Soldado</Text>
            <Text style={styles.subtitle}>Sua central de operações móvel para concursos militares.</Text>

            {/* XP Card */}
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardHighlight}>Nível 3 · Vigia Noturno</Text>
                <Text style={styles.cardMuted}>620 / 750 XP</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: "82%" }]} />
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.grid2}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={styles.statValue}>5 dias</Text>
                <Text style={styles.statLabel}>Streak Diário</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⏱️</Text>
                <Text style={styles.statValue}>{formatarTempoEstudo(108000)}</Text>
                <Text style={styles.statLabel}>Tempo Total</Text>
              </View>
            </View>

            {/* Ação Rápida */}
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Iniciar Sessão de Estudo ⚡</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "concursos" && (
          <View style={styles.section}>
            <Text style={styles.title}>9 Concursos Atendidos</Text>
            <Text style={styles.subtitle}>Selecione para ver o edital verticalizado e simulados.</Text>

            {["EEAR", "ESA", "EAM", "CN", "EPCAR", "EsPCEx", "EFOMM", "IME", "ENEM"].map((sigla) => (
              <View key={sigla} style={styles.concursoCard}>
                <Text style={styles.concursoSigla}>{sigla}</Text>
                <Text style={styles.concursoArrow}>→</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === "questoes" && (
          <View style={styles.section}>
            <Text style={styles.title}>Banco de Questões</Text>
            <Text style={styles.subtitle}>Resolva questões com correção imediata e bizus vinculados.</Text>

            <View style={styles.card}>
              <Text style={styles.badge}>Português · Crase</Text>
              <Text style={styles.questionText}>
                Assinale a alternativa em que o uso da crase está CORRETO:
              </Text>
              {["A) Fui à São Paulo ontem.", "B) Refiro-me à sua proposta.", "C) Ela saiu à pé."].map((opt) => (
                <TouchableOpacity key={opt} style={styles.optionButton}>
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === "ranking" && (
          <View style={styles.section}>
            <Text style={styles.title}>🏆 Ranking dos Guardiões</Text>
            <Text style={styles.subtitle}>Os alunos com maior dedicação e acertos na semana.</Text>

            {[
              { pos: "🥇 #1", nome: "SombraNoturna", xp: "24.500 XP" },
              { pos: "🥈 #2", nome: "GuerreiroDark", xp: "19.200 XP" },
              { pos: "🥉 #3", nome: "BatStudy", xp: "15.800 XP" },
            ].map((r) => (
              <View key={r.pos} style={styles.rankingRow}>
                <Text style={styles.rankingPos}>{r.pos}</Text>
                <Text style={styles.rankingNome}>{r.nome}</Text>
                <Text style={styles.rankingXp}>{r.xp}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { key: "dashboard", label: "Início", icon: "🏠" },
          { key: "concursos", label: "Concursos", icon: "🎯" },
          { key: "questoes", label: "Questões", icon: "❓" },
          { key: "ranking", label: "Ranking", icon: "🏆" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={styles.navItem}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === tab.key && styles.navLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F2B",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  batIcon: {
    fontSize: 22,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F5F5F7",
  },
  logoHighlight: {
    color: "#A855F7",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    borderWidth: 1,
    borderColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#C49CFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F5F5F7",
  },
  subtitle: {
    fontSize: 13,
    color: "#A1A1B5",
    marginTop: -8,
  },
  card: {
    backgroundColor: "#16161E",
    borderWidth: 1,
    borderColor: "#2A2A35",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHighlight: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#A855F7",
  },
  cardMuted: {
    fontSize: 12,
    color: "#6B7280",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#121218",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#7C3AED",
    borderRadius: 4,
  },
  grid2: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#16161E",
    borderWidth: 1,
    borderColor: "#2A2A35",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F5F5F7",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#F5F5F7",
    fontWeight: "bold",
    fontSize: 15,
  },
  concursoCard: {
    backgroundColor: "#16161E",
    borderWidth: 1,
    borderColor: "#2A2A35",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  concursoSigla: {
    color: "#F5F5F7",
    fontSize: 16,
    fontWeight: "bold",
  },
  concursoArrow: {
    color: "#7C3AED",
    fontSize: 18,
    fontWeight: "bold",
  },
  badge: {
    color: "#A855F7",
    fontSize: 12,
    fontWeight: "bold",
  },
  questionText: {
    color: "#F5F5F7",
    fontSize: 14,
    lineHeight: 20,
  },
  optionButton: {
    backgroundColor: "#121218",
    borderWidth: 1,
    borderColor: "#2A2A35",
    borderRadius: 10,
    padding: 12,
  },
  optionText: {
    color: "#A1A1B5",
    fontSize: 13,
  },
  rankingRow: {
    backgroundColor: "#16161E",
    borderWidth: 1,
    borderColor: "#2A2A35",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rankingPos: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#F5C518",
    width: 60,
  },
  rankingNome: {
    color: "#F5F5F7",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  rankingXp: {
    color: "#A855F7",
    fontSize: 13,
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#1F1F2B",
    backgroundColor: "#121218",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  navLabelActive: {
    color: "#A855F7",
    fontWeight: "bold",
  },
});

