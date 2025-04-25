package com.travelcompanion.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Контроллер для обработки перенаправлений запросов в SPA-приложении React.
 * Все запросы, которые не соответствуют статическим ресурсам или API-эндпоинтам,
 * перенаправляются на index.html, чтобы клиентский роутер React мог обработать маршрут.
 */
@Controller
public class ForwardController {
    
    /**
     * Перехватывает все запросы, не обработанные другими контроллерами и 
     * не соответствующие статическим ресурсам, перенаправляя их на index.html.
     * 
     * Это обеспечивает работу клиентской маршрутизации в React при обновлении страницы
     * или прямом переходе по URL.
     */
    @RequestMapping(value = {
        "/", 
        "/{x:[\\w\\-]+}",
        "/{x:^(?!api$|h2-console$|swagger-ui$|assets$|public$).*$}/**/{y:[\\w\\-]+}",
        "/{x:^(?!api$|h2-console$|swagger-ui$|assets$|public$).*$}/**"
    })
    public String forward() {
        return "forward:/public/index.html";
    }
} 