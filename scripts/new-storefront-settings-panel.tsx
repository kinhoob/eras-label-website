function StorefrontSettingsPanel({
  config,
  onChange,
}: {
  config: StorefrontConfig | null;
  onChange: (config: StorefrontConfig) => void;
}) {
  if (!config) {
    return (
      <div className="storefront-settings-panel storefront-settings-loading">
        <LoaderCircle className="admin-auth-spinner" size={20} aria-hidden="true" />
        <span>A carregar as configurações públicas da loja...</span>
      </div>
    );
  }

  const updateAnnouncement = (patch: Partial<StorefrontConfig["announcement"]>) =>
    onChange({ ...config, announcement: { ...config.announcement, ...patch } });
  const updateMaintenance = (patch: Partial<StorefrontConfig["maintenance"]>) =>
    onChange({ ...config, maintenance: { ...config.maintenance, ...patch } });
  const updateDrop = (patch: Partial<StorefrontConfig["drop"]>) =>
    onChange({ ...config, drop: { ...config.drop, ...patch } });
  const dropDate = config.drop.targetAt
    ? new Date(config.drop.targetAt).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })
    : "Data ainda não definida";

  return (
    <section className="storefront-settings-panel">
      <div className="storefront-settings-header">
        <div>
          <span className="section-kicker">EXPERIÊNCIA PÚBLICA</span>
          <h3>Próximo drop &amp; acesso à loja</h3>
          <p>Prepare a próxima era com uma comunicação clara, um contador preciso e um modo de acesso controlado.</p>
        </div>
        <span className={`storefront-status-chip ${config.maintenance.enabled ? "is-active" : ""}`}>
          <span aria-hidden="true" />
          {config.maintenance.enabled ? "Loja trancada" : "Loja aberta"}
        </span>
      </div>

      <div className="storefront-settings-grid">
        <article className={`storefront-control-card storefront-lock-card ${config.maintenance.enabled ? "is-active" : ""}`}>
          <div className="storefront-card-topline">
            <span className="storefront-card-index">01</span>
            <span className="storefront-card-kicker"><LockKeyhole size={14} /> ACESSO</span>
          </div>
          <div className="storefront-card-title-row">
            <div>
              <h4>Trancar site</h4>
              <p>Mostre uma mensagem de preparação enquanto a área pública fica inacessível.</p>
            </div>
            <label className="storefront-switch" aria-label="Trancar a loja para visitantes">
              <input type="checkbox" checked={config.maintenance.enabled} onChange={(event) => updateMaintenance({ enabled: event.target.checked })} />
              <span aria-hidden="true" />
            </label>
          </div>

          <div className="storefront-lock-preview">
            <div className="storefront-lock-preview-brand">ERAS<span>.</span><LockKeyhole size={14} /></div>
            <strong>{config.maintenance.title || "Página em construção"}</strong>
            <p>{config.maintenance.message || "Estamos a preparar a próxima era."}</p>
            {config.drop.enabled && <span className="storefront-lock-preview-drop">{config.drop.title || "PRÓXIMO DROP"}</span>}
          </div>

          <div className="storefront-field-stack">
            <label className="storefront-field"><span>Título da página</span><Input maxLength={100} value={config.maintenance.title} onChange={(event) => updateMaintenance({ title: event.target.value })} placeholder="Página em construção" /></label>
            <label className="storefront-field"><span>Mensagem para clientes</span><textarea maxLength={500} value={config.maintenance.message} onChange={(event) => updateMaintenance({ message: event.target.value })} placeholder="Avise os clientes sobre o próximo drop." /></label>
            <label className="storefront-field"><span>Texto do acesso administrativo</span><Input maxLength={100} value={config.maintenance.accessLabel} onChange={(event) => updateMaintenance({ accessLabel: event.target.value })} /></label>
          </div>
        </article>

        <article className={`storefront-control-card storefront-drop-card ${config.drop.enabled ? "is-active" : ""}`}>
          <div className="storefront-card-topline">
            <span className="storefront-card-index">02</span>
            <span className="storefront-card-kicker"><Megaphone size={14} /> LANÇAMENTO</span>
          </div>
          <div className="storefront-card-title-row">
            <div>
              <h4>Próximo drop</h4>
              <p>Ative um contador regressivo para criar expectativa antes da abertura.</p>
            </div>
            <label className="storefront-switch" aria-label="Mostrar contador regressivo">
              <input type="checkbox" checked={config.drop.enabled} onChange={(event) => updateDrop({ enabled: event.target.checked })} />
              <span aria-hidden="true" />
            </label>
          </div>

          <div className="storefront-drop-preview">
            <span className="storefront-drop-preview-label">CONTAGEM REGRESSIVA</span>
            <strong>{config.drop.title || "PRÓXIMO DROP"}</strong>
            <div className="storefront-countdown-visual" aria-hidden="true">
              {["00", "00", "00", "00"].map((value, index) => (
                <span key={index}><b>{value}</b><small>{["dias", "horas", "min", "seg"][index]}</small></span>
              ))}
            </div>
            <small className="storefront-drop-date">{dropDate}</small>
          </div>

          <div className="storefront-field-grid">
            <label className="storefront-field"><span>Título do contador</span><Input maxLength={100} value={config.drop.title} onChange={(event) => updateDrop({ title: event.target.value })} placeholder="PRÓXIMO DROP" /></label>
            <label className="storefront-field"><span>Data e hora do drop</span><Input type="datetime-local" value={toDateTimeLocal(config.drop.targetAt)} onChange={(event) => updateDrop({ targetAt: fromDateTimeLocal(event.target.value) })} /></label>
          </div>
          <p className="storefront-field-help">A contagem usa o fuso horário local do navegador do visitante e termina automaticamente quando o drop começar.</p>
        </article>
      </div>

      <div className="storefront-announcement-card">
        <div className="storefront-announcement-heading">
          <div>
            <span className="storefront-card-kicker"><Megaphone size={14} /> COMUNICAÇÃO</span>
            <h4>Barra de anúncio</h4>
            <p>Use mensagens curtas para comunicar frete, Pix e novidades em todas as páginas.</p>
          </div>
          <label className="storefront-switch" aria-label="Exibir barra de anúncio na loja">
            <input type="checkbox" checked={config.announcement.enabled} onChange={(event) => updateAnnouncement({ enabled: event.target.checked })} />
            <span aria-hidden="true" />
          </label>
        </div>
        <div className="announcement-message-list storefront-announcement-list">
          <div className="announcement-list-heading"><span>Mensagens rotativas</span><small>{config.announcement.messages.length}/8</small></div>
          {config.announcement.messages.map((message, index) => (
            <div className="announcement-message-row" key={message.id}>
              <span className="announcement-message-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="announcement-message-fields">
                <Input maxLength={180} value={message.text} onChange={(event) => updateAnnouncement({ messages: config.announcement.messages.map((item) => item.id === message.id ? { ...item, text: event.target.value } : item) })} placeholder="Ex.: Frete grátis acima de R$ 350" aria-label={`Mensagem ${index + 1}`} />
                <Input maxLength={500} value={message.href} onChange={(event) => updateAnnouncement({ messages: config.announcement.messages.map((item) => item.id === message.id ? { ...item, href: event.target.value } : item) })} placeholder="Link opcional: /faq ou https://..." aria-label={`Link da mensagem ${index + 1}`} />
              </div>
              <button type="button" className="announcement-remove-button" disabled={config.announcement.messages.length <= 1} onClick={() => updateAnnouncement({ messages: config.announcement.messages.filter((item) => item.id !== message.id) })} aria-label={`Remover mensagem ${index + 1}`}>×</button>
            </div>
          ))}
          <button type="button" className="announcement-add-button" disabled={config.announcement.messages.length >= 8} onClick={() => updateAnnouncement({ messages: [...config.announcement.messages, { id: `announcement-${Date.now()}`, text: "NOVA MENSAGEM", href: "" }] })}><Plus size={14} /> Adicionar mensagem</button>
        </div>
        <div className="storefront-announcement-options">
          <label className="storefront-field"><span>Velocidade de rotação</span><select className="admin-filter-select" value={config.announcement.rotationSpeedSeconds ?? 4} onChange={(event) => updateAnnouncement({ rotationSpeedSeconds: Number(event.target.value) })}>{[2, 3, 4, 5, 6, 8, 10, 15].map((sec) => <option key={sec} value={sec}>{sec} segundos</option>)}</select></label>
          <label className="storefront-color-field"><span>Fundo</span><Input type="color" value={config.announcement.backgroundColor} onChange={(event) => updateAnnouncement({ backgroundColor: event.target.value })} /></label>
          <label className="storefront-color-field"><span>Texto</span><Input type="color" value={config.announcement.textColor} onChange={(event) => updateAnnouncement({ textColor: event.target.value })} /></label>
          <label className="storefront-inline-check"><input type="checkbox" checked={config.announcement.showArrows !== false} onChange={(event) => updateAnnouncement({ showArrows: event.target.checked })} /><span>Exibir setas de navegação</span></label>
        </div>
      </div>
    </section>
  );
}
