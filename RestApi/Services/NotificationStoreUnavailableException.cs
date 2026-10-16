using System;

namespace RestApi.Services;

public sealed class NotificationStoreUnavailableException(Exception inner)
    : Exception("Notification Redis index is unavailable.", inner) { }