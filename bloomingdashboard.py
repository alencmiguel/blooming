import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

st.set_page_config(page_title="Blooming — Dashboard de Captação", layout="wide")

st.title("🌸 Blooming — Dashboard de Captação")
st.write("Visualize cenários de receita por fonte: **Doações**, **Parcerias/Patrocínios**, **Cursos/Workshops** e **Monetização de conteúdo**.")

# --- Upload ---
st.sidebar.header("Dados")
up = st.sidebar.file_uploader("Envie a planilha de cenários (.xlsx)", type=["xlsx"])
default_path = "blooming_dashboard_example.xlsx"

@st.cache_data
def load_sheet(file):
    # Lê sem header e cria colunas genéricas (C1, C2, C3...)
    df = pd.read_excel(file, sheet_name="Cenários", header=None)
    df.columns = ["Label"] + [f"C{i}" for i in range(1, df.shape[1])]
    return df

def get_value(df, label, col):
    rows = df[df["Label"] == label]
    if rows.empty:
        return None
    v = rows.iloc[0][col]
    try:
        return float(v)
    except Exception:
        return None

# Carrega dados
if up is not None:
    df = load_sheet(up)
    source_name = "Arquivo enviado"
else:
    try:
        df = load_sheet(default_path)
        source_name = "Exemplo incluído"
    except Exception:
        st.error("Não encontrei a planilha. Envie o arquivo .xlsx na barra lateral.")
        st.stop()

st.caption(f"Fonte dos dados: **{source_name}** (aba 'Cenários')")

# Mapeia colunas para cenários
scen_cols = {"Pessimista":"C1", "Realista":"C2", "Otimista":"C3"}

# Rótulos (como estão na planilha v2_fix)
L = {
    "period" : "Período (meses)",
    "pf_reach" : "PF — Alcance (pessoas)",
    "pf_conv"  : "PF — Conversão (%)",
    "pf_ticket": "PF — Ticket médio (R$)",
    "co_reach" : "Empresas — Alcance (empresas)",
    "co_conv"  : "Empresas — Conversão (%)",
    "co_ticket": "Empresas — Ticket médio (R$)",
    "par_qtd"  : "Parcerias ativas no mês (qtde)",
    "par_val"  : "Valor mensal por parceria (R$)",
    "wk_ev"    : "Eventos por mês (qtde)",
    "wk_ppl"   : "Participantes por evento",
    "wk_price" : "Preço por participante (R$)",
    "mon_views": "Views por mês",
    "mon_rpm"  : "RPM (R$ por 1.000 views)"
}

# Monta tabela resultado
records = []
for scen, col in scen_cols.items():
    period = get_value(df, L["period"], col) or 1

    pf = (get_value(df, L["pf_reach"], col) or 0) * (get_value(df, L["pf_conv"], col) or 0) * (get_value(df, L["pf_ticket"], col) or 0)
    co = (get_value(df, L["co_reach"], col) or 0) * (get_value(df, L["co_conv"], col) or 0) * (get_value(df, L["co_ticket"], col) or 0)
    par = (get_value(df, L["par_qtd"], col) or 0) * (get_value(df, L["par_val"], col) or 0)
    wk = (get_value(df, L["wk_ev"], col) or 0) * (get_value(df, L["wk_ppl"], col) or 0) * (get_value(df, L["wk_price"], col) or 0)
    mon = ((get_value(df, L["mon_views"], col) or 0) / 1000.0) * (get_value(df, L["mon_rpm"], col) or 0)

    total_month = pf + co + par + wk + mon
    total_period = total_month * period

    records.append({
        "Cenário": scen,
        "Período (meses)": period,
        "Doações (PF)": pf,
        "Doações (Empresas)": co,
        "Parcerias/Patrocínios": par,
        "Cursos/Workshops": wk,
        "Monetização": mon,
        "Total por mês": total_month,
        "Total no período": total_period,
    })

res = pd.DataFrame.from_records(records).set_index("Cenário")

# KPIs
c1, c2, c3 = st.columns(3)
c1.metric("Pessimista — total/mês", f"R$ {res.loc['Pessimista','Total por mês']:,.2f}")
c2.metric("Realista — total/mês", f"R$ {res.loc['Realista','Total por mês']:,.2f}")
c3.metric("Otimista — total/mês", f"R$ {res.loc['Otimista','Total por mês']:,.2f}")

st.divider()
st.subheader("Quebra por fontes (R$ por mês)")
monthly_sources = res[["Doações (PF)", "Doações (Empresas)", "Parcerias/Patrocínios", "Cursos/Workshops", "Monetização"]]

# Gráfico 1 — total por mês por cenário
st.write("**Total por mês por cenário**")
fig1, ax1 = plt.subplots()
ax1.bar(res.index, res["Total por mês"])
ax1.set_ylabel("R$ / mês")
st.pyplot(fig1)

# Gráfico 2 — composição empilhada por fonte
st.write("**Composição por fontes (stacked)**")
fig2, ax2 = plt.subplots()
bottom = None
for col in monthly_sources.columns:
    if bottom is None:
        ax2.bar(monthly_sources.index, monthly_sources[col], label=col)
        bottom = monthly_sources[col].values
    else:
        ax2.bar(monthly_sources.index, monthly_sources[col], bottom=bottom, label=col)
        bottom = bottom + monthly_sources[col].values
ax2.set_ylabel("R$ / mês")
ax2.legend()
st.pyplot(fig2)

st.divider()
st.subheader("Tabela de resultados")
st.dataframe(res.style.format("R$ {:,.2f}", subset=res.columns))

st.caption("Dica: altere os números na planilha e recarregue para ver o impacto nos gráficos.")
