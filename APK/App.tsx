import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Button } from "./src/components/Button";
import { colors, subjects } from "./src/theme";
import { Catalog, Question, getJSON, imageUrl } from "./src/services/api";
import * as store from "./src/services/storage";
import * as auth from "./src/services/auth";
import { cancelReminders, remindTomorrow } from "./src/services/reminders";
type Tab = "home" | "questions" | "offline" | "profile";
export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}
function Main() {
  const [tab, setTab] = useState<Tab>("home"),
    [catalog, setCatalog] = useState<Catalog | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [subject, setSubject] = useState("todas"),
    [year, setYear] = useState(""),
    [items, setItems] = useState<Question[]>([]),
    [index, setIndex] = useState(0),
    [selected, setSelected] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [mode, setMode] = useState<"study" | "mock">("study"),
    [remaining, setRemaining] = useState(0),
    [download, setDownload] = useState(0);
  const [name, setName] = useState(""),
    [goal, setGoal] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [signed, setSigned] = useState(false),
    [rows, setRows] = useState<
      { subject: string; count: number; elapsed: number }[]
    >([]);
  const deadline = useRef(Date.now() + 1800000),
    activeAt = useRef(Date.now()),
    activeMs = useRef(0);
  const { width } = useWindowDimensions();
  const question = items[index];
  async function guard(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Algo não funcionou. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    await guard(async () => {
      setCatalog(await getJSON<Catalog>("/api/v1/catalog"));
      setRows(await store.stats());
    });
  }
  useEffect(() => {
    void refresh();
    void store
      .profile()
      .then((p) => {
        if (p) {
          setName(p.name);
          setGoal(p.goal);
        }
      })
      .catch(() => {});
    void auth
      .restoreSession()
      .then((s) => setSigned(!!s))
      .catch(() => {});
  }, []);
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (items.length) {
        Alert.alert(
          "Encerrar sessão?",
          "Respostas confirmadas ficam apenas neste aparelho.",
          [
            { text: "Continuar", style: "cancel" },
            { text: "Encerrar", onPress: () => setItems([]) },
          ],
        );
        return true;
      }
      if (tab !== "home") {
        setTab("home");
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [items.length, tab]);
  useEffect(() => {
    activeAt.current = Date.now();
    activeMs.current = 0;
    setSelected("");
    setConfirmed(false);
  }, [index, items]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") activeAt.current = Date.now();
      else {
        if (activeAt.current)
          activeMs.current += Math.max(0, Date.now() - activeAt.current);
        activeAt.current = 0;
      }
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!items.length || mode !== "mock") return;
    const timer = setInterval(
      () =>
        setRemaining(
          Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
        ),
      1000,
    );
    return () => clearInterval(timer);
  }, [items.length, mode]);
  async function begin() {
    await guard(async () => {
      const params = new URLSearchParams({
        limit: "10",
        disciplina: subject,
        random: "1",
      });
      if (year) params.set("ano", year);
      const data = await getJSON<{ items: Question[] }>(
        "/api/v1/questions?" + params,
      );
      if (!data.items.length)
        throw new Error("Nenhuma questão para esses filtros.");
      setItems(data.items);
      setIndex(0);
      setRemaining(1800);
      deadline.current = Date.now() + 1800000;
    });
  }
  async function confirm() {
    if (!question || !selected || confirmed) return;
    await guard(async () => {
      const elapsed =
        activeMs.current +
        (activeAt.current ? Date.now() - activeAt.current : 0);
      await store.saveAttempt(question, selected, elapsed);
      setConfirmed(true);
      setRows(await store.stats());
    });
  }
  function next() {
    if (index + 1 >= items.length) {
      setItems([]);
      setTab("home");
      Alert.alert(
        "Sessão concluída",
        "Respostas registradas no aparelho. Gabaritos ainda em preparação; não há nota calculada.",
      );
    } else setIndex(index + 1);
  }
  const total = rows.reduce((n, r) => n + r.count, 0),
    minutes = Math.round(rows.reduce((n, r) => n + r.elapsed, 0) / 60000);
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.header}>
          <Text style={s.brand}>gabaru.</Text>
          <Text style={s.badge}>PRÉVIA ANDROID</Text>
        </View>
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            !items.length ? (
              <RefreshControl
                refreshing={busy}
                onRefresh={() => void refresh()}
              />
            ) : undefined
          }
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <View accessibilityRole="alert" style={s.notice}>
              <Text style={s.body}>{error}</Text>
              <Button
                secondary
                label="Fechar aviso"
                onPress={() => setError("")}
              />
            </View>
          ) : null}
          {busy ? (
            <ActivityIndicator
              accessibilityLabel="Carregando"
              color={colors.ink}
            />
          ) : null}
          {question ? (
            <>
              <Text style={s.eyebrow}>
                {mode === "mock"
                  ? `SESSÃO CRONOMETRADA · ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
                  : "MODO ESTUDO"}
              </Text>
              <Text style={s.title}>
                Questão {index + 1} de {items.length}
              </Text>
              <Text style={s.body}>
                ENEM {question.ano} ·{" "}
                {subjects[question.disciplina] || question.disciplina}
              </Text>
              <ScrollView horizontal maximumZoomScale={3} minimumZoomScale={1}>
                <Image
                  accessibilityLabel={`Enunciado da questão ${question.numero} do ENEM ${question.ano}. Texto alternativo completo ainda em revisão.`}
                  source={{
                    uri: question.img.startsWith("file:")
                      ? question.img
                      : imageUrl(question),
                  }}
                  style={{
                    width: Math.max(width - 48, question.w),
                    height: question.h,
                    backgroundColor: "white",
                  }}
                  resizeMode="contain"
                />
              </ScrollView>
              <Text style={s.body}>{question.tema}</Text>
              <View style={s.choices}>
                {["A", "B", "C", "D", "E"].map((letter) => (
                  <View key={letter} style={{ flex: 1 }}>
                    <Button
                      label={letter}
                      secondary={selected !== letter}
                      disabled={confirmed || busy}
                      onPress={() => setSelected(letter)}
                    />
                  </View>
                ))}
              </View>
              <Button
                label={
                  confirmed
                    ? "Resposta registrada no aparelho"
                    : "Confirmar resposta"
                }
                disabled={
                  !selected ||
                  confirmed ||
                  busy ||
                  (mode === "mock" && remaining === 0)
                }
                onPress={() => void confirm()}
              />
              {confirmed ? (
                <Text style={s.notice}>
                  Gabarito oficial ainda não integrado. Não calculamos acerto ou
                  erro.
                </Text>
              ) : null}
              <Button
                secondary
                label={
                  index + 1 === items.length
                    ? "Concluir sessão"
                    : "Próxima questão"
                }
                disabled={!confirmed && !(mode === "mock" && remaining === 0)}
                onPress={next}
              />
              <Button
                secondary
                label="Compartilhar dúvida"
                onPress={() =>
                  void Share.share({
                    message: `Estou estudando a questão ${question.numero} do ENEM ${question.ano}: ${question.tema}. https://gabaru.com.br/treino`,
                  })
                }
              />
              <Button
                secondary
                label="Encerrar sessão"
                onPress={() => setItems([])}
              />
            </>
          ) : (
            <>
              {tab === "home" && (
                <>
                  <Text style={s.eyebrow}>UM PASSO DE CADA VEZ</Text>
                  <Text style={s.title}>
                    Olá{name ? `, ${name}` : ""}. Vamos praticar?
                  </Text>
                  <Text style={s.body}>
                    Seu espaço de estudo, inclusive sem conexão depois de baixar
                    um pacote.
                  </Text>
                  <View style={s.card}>
                    <Text style={s.subtitle}>
                      {total} respostas · {minutes} min
                    </Text>
                    <Text style={s.body}>
                      Atividade local deste aparelho. Acertos e erros aguardam
                      gabaritos revisados; não há sincronização com sua conta.
                    </Text>
                  </View>
                  <Button
                    label="Escolher questões"
                    onPress={() => setTab("questions")}
                  />
                  <Button
                    secondary
                    label="Meus downloads"
                    onPress={() => setTab("offline")}
                  />
                  {rows.map((r) => (
                    <View style={s.card} key={r.subject}>
                      <Text style={s.subtitle}>
                        {subjects[r.subject] || r.subject}
                      </Text>
                      <Text style={s.body}>
                        {r.count} respostas · {Math.round(r.elapsed / 60000)}{" "}
                        min de prática
                      </Text>
                    </View>
                  ))}
                  <Text style={s.body}>
                    Videoaulas, PDFs, correção e trilhas por instituição estão
                    em preparação.
                  </Text>
                </>
              )}
              {tab === "questions" && (
                <>
                  <Text style={s.title}>Seu próximo desafio.</Text>
                  <Text style={s.body}>
                    Instituição atual: ENEM. Dificuldade ainda não calibrada.
                  </Text>
                  <Text style={s.subtitle}>Disciplina</Text>
                  <View style={s.wrap}>
                    {[
                      { slug: "todas", count: catalog?.total || 0 },
                      ...(catalog?.disciplines || []),
                    ].map((d) => (
                      <Button
                        key={d.slug}
                        label={
                          d.slug === "todas"
                            ? "Todas"
                            : subjects[d.slug] || d.slug
                        }
                        secondary={subject !== d.slug}
                        onPress={() => setSubject(d.slug)}
                      />
                    ))}
                  </View>
                  <Text style={s.subtitle}>Ano (opcional)</Text>
                  <TextInput
                    style={s.input}
                    value={year}
                    onChangeText={setYear}
                    placeholder="Ex.: 2020"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                  <View style={s.wrap}>
                    <Button
                      label="Estudo"
                      secondary={mode !== "study"}
                      onPress={() => setMode("study")}
                    />
                    <Button
                      label="Cronometrado · 30 min"
                      secondary={mode !== "mock"}
                      onPress={() => setMode("mock")}
                    />
                  </View>
                  <Text style={s.notice}>
                    Sessão de prática com 10 questões. Não é um simulado oficial
                    nem gera nota. Correção automática aguarda gabaritos
                    revisados.
                  </Text>
                  <Button
                    label="Começar sessão"
                    disabled={busy || !catalog}
                    onPress={() => void begin()}
                  />
                  <Button
                    secondary
                    disabled={busy || !catalog}
                    label={
                      download
                        ? `Baixando ${download}/10…`
                        : "Baixar 10 questões para usar offline"
                    }
                    onPress={() =>
                      void guard(async () => {
                        try {
                          const params = new URLSearchParams({
                            limit: "10",
                            disciplina: subject,
                          });
                          if (year) params.set("ano", year);
                          const data = await getJSON<{ items: Question[] }>(
                            "/api/v1/questions?" + params,
                          );
                          if (!data.items.length)
                            throw new Error("Sem questões para baixar");
                          await store.savePack(data.items, setDownload);
                          Alert.alert("Pronto", "Pacote salvo no aparelho.");
                        } finally {
                          setDownload(0);
                        }
                      })
                    }
                  />
                </>
              )}
              {tab === "offline" && (
                <>
                  <Text style={s.title}>Estude sem conexão.</Text>
                  <Text style={s.body}>
                    O pacote contém enunciados e imagens baixados. As respostas
                    ficam neste aparelho.
                  </Text>
                  <Button
                    label="Abrir pacote baixado"
                    disabled={busy}
                    onPress={() =>
                      void guard(async () => {
                        const pack = await store.getPack();
                        if (!pack.length)
                          throw new Error(
                            "Nenhum pacote. Conecte-se e baixe questões primeiro.",
                          );
                        setItems(pack);
                        setIndex(0);
                        setMode("study");
                      })
                    }
                  />
                  <Text style={s.notice}>
                    Downloads de videoaulas e PDFs entram quando houver conteúdo
                    próprio publicado e autorização de distribuição offline.
                  </Text>
                </>
              )}
              {tab === "profile" && (
                <>
                  <Text style={s.title}>Seu perfil.</Text>
                  <Text style={s.body}>
                    Nome e meta são salvos apenas no aparelho.
                  </Text>
                  <Text style={s.subtitle}>Nome</Text>
                  <TextInput
                    style={s.input}
                    value={name}
                    onChangeText={setName}
                    autoComplete="name"
                  />
                  <Text style={s.subtitle}>Meta de prova</Text>
                  <TextInput
                    style={s.input}
                    value={goal}
                    onChangeText={setGoal}
                    placeholder="Ex.: ETEC"
                  />
                  <Button
                    label="Salvar perfil local"
                    onPress={() =>
                      void guard(async () => {
                        await store.saveProfile(name, goal);
                        Alert.alert("Perfil salvo");
                      })
                    }
                  />
                  <Text style={s.subtitle}>Conta Gabaru</Text>
                  {signed ? (
                    <>
                      <Text style={s.body}>
                        Sessão autenticada. A atividade local ainda não
                        sincroniza com a conta.
                      </Text>
                      <Button
                        secondary
                        label="Sair da conta"
                        onPress={() =>
                          void guard(async () => {
                            await auth.signOut();
                            setSigned(false);
                          })
                        }
                      />
                    </>
                  ) : (
                    <>
                      <TextInput
                        style={s.input}
                        accessibilityLabel="E-mail"
                        placeholder="E-mail"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                        value={email}
                        onChangeText={setEmail}
                      />
                      <TextInput
                        style={s.input}
                        accessibilityLabel="Senha"
                        placeholder="Senha"
                        secureTextEntry
                        autoComplete="current-password"
                        value={password}
                        onChangeText={setPassword}
                      />
                      <Button
                        label="Entrar com e-mail"
                        disabled={busy}
                        onPress={() =>
                          void guard(async () => {
                            await auth.signIn(email, password);
                            setPassword("");
                            setSigned(true);
                          })
                        }
                      />
                      <Text style={s.body}>
                        Google, Apple, cadastro, exclusão de conta e foto de
                        perfil ainda exigem implementação/configuração antes da
                        distribuição pública.
                      </Text>
                    </>
                  )}
                  <Button
                    secondary
                    label="Lembrar de estudar amanhã"
                    onPress={() =>
                      void guard(async () => {
                        await remindTomorrow();
                        Alert.alert("Lembrete agendado");
                      })
                    }
                  />
                  <Button
                    secondary
                    label="Desativar lembretes"
                    onPress={() =>
                      void guard(async () => {
                        await cancelReminders();
                        Alert.alert("Lembretes desativados");
                      })
                    }
                  />
                  <Button
                    secondary
                    label="Apagar dados deste aparelho"
                    onPress={() =>
                      Alert.alert(
                        "Apagar dados locais?",
                        "Remove perfil, respostas e downloads. Sua conta Firebase não será excluída.",
                        [
                          { text: "Cancelar", style: "cancel" },
                          {
                            text: "Apagar",
                            style: "destructive",
                            onPress: () =>
                              void guard(async () => {
                                await store.clearLocal();
                                setRows([]);
                                setName("");
                                setGoal("");
                              }),
                          },
                        ],
                      )
                    }
                  />
                </>
              )}
            </>
          )}
        </ScrollView>
        {!items.length && (
          <View style={s.tabs}>
            {(
              [
                ["home", "Início"],
                ["questions", "Questões"],
                ["offline", "Offline"],
                ["profile", "Perfil"],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <View key={id} style={{ flex: 1 }}>
                <Button
                  secondary={tab !== id}
                  label={label}
                  onPress={() => setTab(id)}
                />
              </View>
            ))}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 31,
    fontWeight: "800",
    letterSpacing: -1.5,
    color: colors.ink,
  },
  badge: { fontSize: 10, color: colors.muted },
  content: { padding: 24, paddingBottom: 40, gap: 15 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.muted,
  },
  title: {
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: -1.3,
    color: colors.ink,
  },
  subtitle: { fontSize: 20, fontWeight: "600", color: colors.ink },
  body: { fontSize: 16, lineHeight: 25, color: colors.muted },
  card: {
    padding: 22,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 7,
    gap: 12,
  },
  notice: {
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: 6,
    color: colors.ink,
    lineHeight: 23,
    fontSize: 14,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 5,
    padding: 14,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choices: { flexDirection: "row", gap: 8 },
  tabs: {
    flexDirection: "row",
    padding: 8,
    gap: 4,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
});
